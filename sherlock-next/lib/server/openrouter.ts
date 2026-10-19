import 'server-only';
import { type ChatMessage, foldSystemIntoUser } from './chat-utils';

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

export interface CompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens: number;
    stream?: boolean;
    /** OpenRouter provider ordering; 'price' keeps trial calls on the cheapest provider. */
    providerSort?: 'price' | 'throughput' | 'latency';
}

export interface TokenUsage {
    tokens: number;
    costUsd: number;
}

function post(apiKey: string, req: CompletionRequest): Promise<Response> {
    return fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://agentic-sherlock.vercel.app',
            'X-Title': 'Agent Sherlock',
        },
        body: JSON.stringify({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature,
            max_tokens: req.maxTokens,
            ...(req.stream ? { stream: true } : {}),
            ...(req.providerSort ? { provider: { sort: req.providerSort } } : {}),
        }),
    });
}

/**
 * Calls OpenRouter with the app's fallbacks: a rate-limited `:free` model is retried on its paid
 * variant, and a 400 caused by a system-role message is retried with the system prompt folded
 * into the first user turn (some providers reject system messages).
 */
export async function requestCompletion(apiKey: string, req: CompletionRequest): Promise<Response> {
    let model = req.model;
    let response = await post(apiKey, req);

    if (response.status === 429 && model.endsWith(':free')) {
        model = model.replace(/:free$/, '');
        response = await post(apiKey, { ...req, model });
    }

    if (response.status === 400 && req.messages.some(m => m.role === 'system')) {
        response = await post(apiKey, { ...req, model, messages: foldSystemIntoUser(req.messages) });
    }

    return response;
}

/** Reads OpenRouter's `usage` block (present on every completion and on the last stream chunk). */
export function readUsage(json: unknown): TokenUsage | null {
    const usage = (json as { usage?: Record<string, unknown> } | null)?.usage;
    if (!usage) return null;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const tokens = num(usage.prompt_tokens) + num(usage.completion_tokens) || num(usage.total_tokens);
    return { tokens, costUsd: num(usage.cost) };
}

/** Rough token count for text we haven't been billed for yet (deliberately on the high side). */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 3);
}

/**
 * Pipes an OpenRouter SSE response to the client unchanged. When `onEnd` is given, the stream is
 * also scanned so the caller learns the final usage (or, if the stream is cut short, the text
 * streamed so far). `onEnd` runs before the stream closes, so serverless runtimes keep it alive.
 */
export function pipeStream(
    upstream: Response,
    onEnd?: (usage: TokenUsage | null, streamedText: string) => Promise<void>,
): Response {
    const reader = upstream.body!.getReader();
    const decoder = new TextDecoder();
    let pending = '';
    let streamedText = '';
    let usage: TokenUsage | null = null;
    let ended = false;

    const end = async () => {
        if (ended) return;
        ended = true;
        await onEnd?.(usage, streamedText);
    };

    const scan = (chunk: string) => {
        pending += chunk;
        const lines = pending.split('\n');
        pending = lines.pop() ?? '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const payload = trimmed.slice(6);
            if (payload === '[DONE]') continue;
            try {
                const json = JSON.parse(payload);
                streamedText += json.choices?.[0]?.delta?.content ?? '';
                usage = readUsage(json) ?? usage;
            } catch { /* keep-alive comment or partial line */ }
        }
    };

    const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (onEnd) scan(decoder.decode(value, { stream: true }));
                    controller.enqueue(value);
                }
                if (onEnd) scan(decoder.decode() + '\n');
                await end();
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
            } catch {
                await end();
                try { controller.close(); } catch { /* already cancelled */ }
            }
        },
        async cancel() {
            await reader.cancel();
            await end();
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
