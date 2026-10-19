import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import type { ChatMessage } from '@/lib/server/chat-utils';
import { estimateTokens, type TokenUsage } from '@/lib/server/openrouter';
import { getTrialApiKey, trialConfig } from './config';
import { attachTrialCookie, getTrialIdentity } from './identity';
import { reserveTrialUsage, settleTrialUsage } from './quota';

export { trialConfig, getTrialApiKey } from './config';
export { getTrialIdentity, attachTrialCookie } from './identity';
export { getTrialStatus } from './quota';

const TRIAL_ERRORS = {
    TRIAL_EXHAUSTED: {
        status: 402,
        message: "You've used your free trial. Create an account and add your own OpenRouter key to keep playing.",
    },
    TRIAL_PAUSED: {
        status: 429,
        message: 'The free trial has reached its daily limit. Add your own OpenRouter key to keep playing, or come back tomorrow.',
    },
    TRIAL_TOO_LONG: {
        status: 413,
        message: 'This conversation is too long for the free trial. Start a new one, or add your own OpenRouter key.',
    },
    TRIAL_UNAVAILABLE: {
        status: 503,
        message: 'Please set your OpenRouter API key in Settings to continue.',
    },
    TRIAL_OFFLINE: {
        status: 503,
        message: 'The free trial is temporarily unavailable. Add your own OpenRouter key in Settings to keep playing.',
    },
    TRIAL_UPSTREAM: {
        status: 502,
        message: 'The AI model is not responding right now. Please try again in a moment.',
    },
} as const;

export type TrialErrorCode = keyof typeof TRIAL_ERRORS;

export function trialError(code: TrialErrorCode): NextResponse {
    const { status, message } = TRIAL_ERRORS[code];
    return NextResponse.json({ error: message, code }, { status });
}

/** Trial requests may only carry plain user/assistant turns; the system prompt is always the app's own. */
export function sanitizeTrialMessages(raw: unknown): ChatMessage[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((m): m is ChatMessage =>
            !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content }));
}

export interface TrialRequest {
    apiKey: string;
    model: string;
    /** Records what the request really cost. Falls back to an estimate when usage is unknown. */
    finish: (usage: TokenUsage | null, completionText?: string) => Promise<void>;
    /** Sets the trial cookie on first-time visitors' responses. */
    withCookie: <T extends NextResponse>(response: T) => T;
}

/**
 * Admits a request onto the free trial (the app's own OpenRouter key) and reserves its worst-case
 * token cost. Returns the error response to send instead when the trial can't take it.
 */
export async function startTrialRequest(
    request: NextRequest,
    messages: ChatMessage[],
    maxTokens: number,
): Promise<{ trial: TrialRequest } | { response: NextResponse }> {
    const apiKey = getTrialApiKey();
    if (!apiKey) return { response: trialError('TRIAL_UNAVAILABLE') };

    const identity = getTrialIdentity(request);
    const withCookie = <T extends NextResponse>(response: T): T => {
        attachTrialCookie(response, identity);
        return response;
    };

    const promptTokens = estimateTokens(messages.map(m => m.content).join('\n'));
    if (promptTokens > trialConfig.maxPromptTokens) {
        return { response: withCookie(trialError('TRIAL_TOO_LONG')) };
    }

    let result: Awaited<ReturnType<typeof reserveTrialUsage>>;
    try {
        result = await reserveTrialUsage(identity, promptTokens + maxTokens);
    } catch (error) {
        // No usage tracking means no free requests: fail closed so the key can't be drained.
        console.error('Trial quota check failed:', error instanceof Error ? error.message : error);
        return { response: withCookie(trialError('TRIAL_OFFLINE')) };
    }
    if (!result.ok) {
        return { response: withCookie(trialError(result.reason === 'paused' ? 'TRIAL_PAUSED' : 'TRIAL_EXHAUSTED')) };
    }

    let finished = false;
    const finish = async (usage: TokenUsage | null, completionText = '') => {
        if (finished) return;
        finished = true;
        const actual = usage ?? { tokens: promptTokens + estimateTokens(completionText), costUsd: 0 };
        try {
            await settleTrialUsage(result.reservation, actual);
        } catch (error) {
            console.error('Failed to record trial usage:', error instanceof Error ? error.message : error);
        }
    };

    return { trial: { apiKey, model: trialConfig.model, finish, withCookie } };
}

/** Logs an OpenRouter failure on a trial request without forwarding OpenRouter's account details to the client. */
export async function trialUpstreamError(trial: TrialRequest, upstream: Response): Promise<NextResponse> {
    const detail = (await upstream.text().catch(() => '')).slice(0, 300);
    console.error(`Trial OpenRouter error ${upstream.status}: ${detail}`);
    await trial.finish({ tokens: 0, costUsd: 0 });
    return trial.withCookie(trialError('TRIAL_UPSTREAM'));
}
