import 'server-only';

function numberEnv(name: string, fallback: number): number {
    const raw = process.env[name]?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** Free-trial limits. Every value can be overridden with the env var named next to it. */
export const trialConfig = {
    /** Model used for all trial requests, whatever the client asks for. */
    model: process.env.TRIAL_MODEL?.trim() || 'z-ai/glm-5.3',
    /** Lifetime tokens per browser (prompt + completion, as billed by OpenRouter). */
    tokenLimit: numberEnv('TRIAL_TOKEN_LIMIT', 30_000),
    /** Daily tokens per IP address (IPv6: per /64), so clearing cookies doesn't reset the trial. */
    ipDailyTokenLimit: numberEnv('TRIAL_IP_DAILY_TOKEN_LIMIT', 90_000),
    /** Daily tokens across all trial users. */
    globalDailyTokenLimit: numberEnv('TRIAL_GLOBAL_DAILY_TOKEN_LIMIT', 600_000),
    /** Daily OpenRouter spend (USD) across all trial users. */
    globalDailyUsdLimit: numberEnv('TRIAL_GLOBAL_DAILY_USD_LIMIT', 0.2),
    /** Largest prompt a single trial request may send (estimated tokens). */
    maxPromptTokens: numberEnv('TRIAL_MAX_PROMPT_TOKENS', 16_000),
};

/** The app's own OpenRouter key. Server-side only: never send it to the client or log it. */
export function getTrialApiKey(): string | null {
    return process.env.OPENROUTER_API_KEY?.trim() || null;
}
