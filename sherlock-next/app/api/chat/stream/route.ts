import { NextRequest } from 'next/server';
import { buildSystemPrompt, type PromptParams } from '@/lib/prompts/builder';

export const runtime = 'edge';

interface ChatMessage {
    role: string;
    content: string;
}

function foldSystemIntoUser(messages: ChatMessage[]): ChatMessage[] {
    const systemMsg = messages.find(m => m.role === 'system');
    if (!systemMsg) return messages;

    const rest = messages.filter(m => m.role !== 'system');
    const firstUserIdx = rest.findIndex(m => m.role === 'user');
    if (firstUserIdx !== -1) {
        rest[firstUserIdx] = {
            ...rest[firstUserIdx],
            content: `[System Instructions]\n${systemMsg.content}\n\n[User Message]\n${rest[firstUserIdx].content}`,
        };
    } else {
        rest.unshift({ role: 'user', content: systemMsg.content });
    }
    return rest;
}

async function callStream(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    apiKey: string,
): Promise<Response> {
    return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens: 2000, stream: true }),
    });
}

function pipeStream(upstream: Response): Response {
    const reader = upstream.body!.getReader();
    const readable = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                        controller.close();
                        break;
                    }
                    controller.enqueue(value);
                }
            } catch {
                controller.close();
            }
        },
        cancel() { reader.cancel(); },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

function jsonError(message: string, status: number): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages: rawMessages, temperature, apiKey, promptParams } = body;

        if (!apiKey) {
            return jsonError('API key is required', 400);
        }

        let messages: ChatMessage[] = rawMessages;
        if (promptParams) {
            const systemPrompt = buildSystemPrompt(promptParams as PromptParams);
            const hasSystem = messages.some((m: ChatMessage) => m.role === 'system');
            if (!hasSystem) {
                messages = [{ role: 'system', content: systemPrompt }, ...messages];
            }
        }

        let response = await callStream(model, messages, temperature, apiKey);

        if (response.status === 429 && model.endsWith(':free')) {
            const paidModel = model.replace(/:free$/, '');
            response = await callStream(paidModel, messages, temperature, apiKey);

            if (response.status === 400 && messages.some((m: ChatMessage) => m.role === 'system')) {
                response = await callStream(paidModel, foldSystemIntoUser(messages), temperature, apiKey);
            }

            if (response.ok && response.body) return pipeStream(response);
        }

        if (response.status === 400 && messages.some((m: ChatMessage) => m.role === 'system')) {
            response = await callStream(model, foldSystemIntoUser(messages), temperature, apiKey);

            if (response.ok && response.body) return pipeStream(response);
        }

        if (!response.ok) {
            const errorText = await response.text();
            return jsonError(`OpenRouter API error: ${response.status} - ${errorText}`, response.status);
        }

        if (!response.body) {
            return jsonError('No response body from upstream', 502);
        }

        return pipeStream(response);
    } catch (error) {
        console.error('Stream API error:', error);
        return jsonError(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}
