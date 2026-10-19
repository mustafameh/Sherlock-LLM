'use client';

export const TRIAL_EVENT = 'sherlock:trial';

/** Error from one of the app's API routes; `code` is set for free-trial limits (e.g. TRIAL_EXHAUSTED). */
export class ApiError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}

/** Asks the trial context to re-check the allowance; with a TRIAL_* code it also shows the trial notice. */
export function notifyTrial(code?: string): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(TRIAL_EVENT, { detail: { code } }));
}

/** Builds the error for a failed API response, flagging free-trial limits to the trial context. */
export async function readApiError(res: Response, fallback: string): Promise<ApiError> {
    const data = await res.json().catch(() => ({}));
    const code = typeof data.code === 'string' ? data.code : undefined;
    if (code?.startsWith('TRIAL_')) notifyTrial(code);
    return new ApiError(data.error || fallback, code);
}
