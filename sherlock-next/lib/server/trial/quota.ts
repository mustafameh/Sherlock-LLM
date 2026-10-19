import 'server-only';
import dbConnect from '@/lib/server/mongodb';
import TrialUsage from '@/lib/models/TrialUsage';
import type { TokenUsage } from '@/lib/server/openrouter';
import { trialConfig } from './config';
import type { TrialIdentity } from './identity';

const DAY_MS = 24 * 60 * 60 * 1000;

interface Bucket {
    id: string;
    tokenLimit: number;
    usdLimit?: number;
    /** How long the document lives after its last use. */
    ttlMs: number;
}

function bucketsFor(identity: TrialIdentity) {
    const day = new Date().toISOString().slice(0, 10);
    return {
        user: { id: `anon:${identity.anonId}`, tokenLimit: trialConfig.tokenLimit, ttlMs: 180 * DAY_MS },
        ip: { id: `ip:${identity.ipHash}:${day}`, tokenLimit: trialConfig.ipDailyTokenLimit, ttlMs: 2 * DAY_MS },
        global: {
            id: `global:${day}`,
            tokenLimit: trialConfig.globalDailyTokenLimit,
            usdLimit: trialConfig.globalDailyUsdLimit,
            ttlMs: 30 * DAY_MS,
        },
    } satisfies Record<string, Bucket>;
}

function isDuplicateKey(error: unknown): boolean {
    return (error as { code?: number })?.code === 11000;
}

/**
 * Atomically adds `tokens` to a bucket, but only while the bucket is still under its limit, so
 * parallel requests can't all slip through once the limit is reached.
 */
async function charge(bucket: Bucket, tokens: number): Promise<boolean> {
    const filter: Record<string, unknown> = { _id: bucket.id, tokens: { $lt: bucket.tokenLimit } };
    if (bucket.usdLimit !== undefined) filter.costUsd = { $lt: bucket.usdLimit };
    const update = {
        $inc: { tokens, requests: 1 },
        $set: { expiresAt: new Date(Date.now() + bucket.ttlMs) },
    };

    try {
        // Creates the bucket on first use. If it exists but is over its limit, the filter
        // misses and the insert hits the duplicate _id.
        await TrialUsage.updateOne(filter, update, { upsert: true });
        return true;
    } catch (error) {
        if (!isDuplicateKey(error)) throw error;
        // Over the limit, or a concurrent request created the bucket first: retry without upsert.
        const result = await TrialUsage.updateOne(filter, update);
        return result.modifiedCount === 1;
    }
}

export type TrialDenial = 'exhausted' | 'paused';

export interface TrialReservation {
    bucketIds: string[];
    reservedTokens: number;
}

/**
 * Reserves `tokens` (an upper bound for the coming request) against the visitor's trial, their
 * network's daily allowance and the global daily cap. Settle it with `settleTrialUsage`; if it is
 * never settled (crash, dropped connection) the reservation simply stays counted.
 */
export async function reserveTrialUsage(
    identity: TrialIdentity,
    tokens: number,
): Promise<{ ok: true; reservation: TrialReservation } | { ok: false; reason: TrialDenial }> {
    await dbConnect();
    const buckets = bucketsFor(identity);
    const order: Array<[Bucket, TrialDenial]> = [
        [buckets.user, 'exhausted'],
        [buckets.ip, 'exhausted'],
        [buckets.global, 'paused'],
    ];

    const charged: string[] = [];
    for (const [bucket, reason] of order) {
        if (!(await charge(bucket, tokens))) {
            if (charged.length) {
                await TrialUsage.updateMany({ _id: { $in: charged } }, { $inc: { tokens: -tokens, requests: -1 } });
            }
            return { ok: false, reason };
        }
        charged.push(bucket.id);
    }

    return { ok: true, reservation: { bucketIds: charged, reservedTokens: tokens } };
}

/** Replaces a reservation with what OpenRouter actually billed. */
export async function settleTrialUsage(reservation: TrialReservation, actual: TokenUsage): Promise<void> {
    await dbConnect();
    await TrialUsage.updateMany(
        { _id: { $in: reservation.bucketIds } },
        { $inc: { tokens: actual.tokens - reservation.reservedTokens, costUsd: actual.costUsd } },
    );
}

export interface TrialStatus {
    limit: number;
    used: number;
    remaining: number;
    /** This visitor (or their network, today) has used up the trial. */
    exhausted: boolean;
    /** The global daily cap is reached; the trial resumes tomorrow (UTC). */
    paused: boolean;
}

export async function getTrialStatus(identity: TrialIdentity): Promise<TrialStatus> {
    await dbConnect();
    const buckets = bucketsFor(identity);
    const docs = await TrialUsage.find({ _id: { $in: [buckets.user.id, buckets.ip.id, buckets.global.id] } }).lean();
    const byId = new Map(docs.map(d => [d._id, d]));

    const used = byId.get(buckets.user.id)?.tokens ?? 0;
    const ipUsed = byId.get(buckets.ip.id)?.tokens ?? 0;
    const global = byId.get(buckets.global.id);
    const exhausted = used >= buckets.user.tokenLimit || ipUsed >= buckets.ip.tokenLimit;
    const paused = (global?.tokens ?? 0) >= buckets.global.tokenLimit
        || (global?.costUsd ?? 0) >= buckets.global.usdLimit;

    return {
        limit: buckets.user.tokenLimit,
        used: Math.min(used, buckets.user.tokenLimit),
        remaining: exhausted ? 0 : Math.max(0, buckets.user.tokenLimit - used),
        exhausted,
        paused,
    };
}
