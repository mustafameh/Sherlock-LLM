import 'server-only';
import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sherlock_trial';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const isProduction = process.env.NODE_ENV === 'production';

export interface TrialIdentity {
    /** Random id from the signed trial cookie. */
    anonId: string;
    /** HMAC of the client's network address; the raw IP is never stored. */
    ipHash: string;
    /** Cookie value to set when the visitor arrived without a valid one. */
    newCookie: string | null;
}

function getSecret(): Buffer {
    const explicit = process.env.TRIAL_COOKIE_SECRET;
    if (explicit) return Buffer.from(explicit);
    const base = process.env.API_KEY_SECRET;
    if (!base) throw new Error('TRIAL_COOKIE_SECRET or API_KEY_SECRET must be set');
    return crypto.createHmac('sha256', base).update('sherlock-trial-cookie-v1').digest();
}

function sign(value: string): string {
    return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function verifyCookie(raw: string): string | null {
    const [id, signature] = raw.split('.');
    if (!id || !signature) return null;
    const expected = Buffer.from(sign(`anon:${id}`));
    const actual = Buffer.from(signature);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected) ? id : null;
}

/** IPv4 as-is; IPv6 reduced to its /64, since one connection can rotate through a whole /64. */
function networkOf(ip: string): string {
    const address = ip.replace(/%.*$/, '').toLowerCase();
    const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return mapped[1];
    if (!address.includes(':')) return address;

    const [head, tail] = address.split('::');
    const headParts = head ? head.split(':') : [];
    const tailParts = tail ? tail.split(':') : [];
    const zeros = tail === undefined ? 0 : 8 - headParts.length - tailParts.length;
    const groups = [...headParts, ...Array(Math.max(zeros, 0)).fill('0'), ...tailParts];
    return groups.slice(0, 4).map(g => parseInt(g || '0', 16).toString(16)).join(':') + '::/64';
}

function clientNetwork(request: NextRequest): string {
    // On Vercel both headers are set by the platform and can't be spoofed by the client.
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = request.headers.get('x-real-ip')?.trim() || forwarded;
    return ip ? networkOf(ip) : 'unknown';
}

export function getTrialIdentity(request: NextRequest): TrialIdentity {
    const raw = request.cookies.get(COOKIE_NAME)?.value;
    let anonId = raw ? verifyCookie(raw) : null;
    let newCookie: string | null = null;

    if (!anonId) {
        anonId = crypto.randomBytes(16).toString('base64url');
        newCookie = `${anonId}.${sign(`anon:${anonId}`)}`;
    }

    return { anonId, ipHash: sign(`ip:${clientNetwork(request)}`), newCookie };
}

export function attachTrialCookie(response: NextResponse, identity: TrialIdentity): void {
    if (!identity.newCookie) return;
    response.cookies.set(COOKIE_NAME, identity.newCookie, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    });
}
