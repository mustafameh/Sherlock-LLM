import { NextRequest } from 'next/server';

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

async function callOpenRouterStream(
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

async function callOpenRouterNonStream(
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
        body: JSON.stringify({ model, messages, temperature, max_tokens: 2000 }),
    });
}

async function resolveWorkingParams(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    apiKey: string,
): Promise<{ model: string; messages: ChatMessage[] }> {
    const probe = await callOpenRouterNonStream(model, messages, temperature, apiKey);

    if (probe.ok) {
        return { model, messages };
    }

    if (probe.status === 429 && model.endsWith(':free')) {
        const paidModel = model.replace(/:free$/, '');
        const retry = await callOpenRouterNonStream(paidModel, messages, temperature, apiKey);
        if (retry.ok) return { model: paidModel, messages };

        if (retry.status === 400 && messages.some(m => m.role === 'system')) {
            const folded = foldSystemIntoUser(messages);
            const retry2 = await callOpenRouterNonStream(paidModel, folded, temperature, apiKey);
            if (retry2.ok) return { model: paidModel, messages: folded };
        }
    }

    if (probe.status === 400 && messages.some(m => m.role === 'system')) {
        const folded = foldSystemIntoUser(messages);
        const retry = await callOpenRouterNonStream(model, folded, temperature, apiKey);
        if (retry.ok) return { model, messages: folded };
    }

    const errorData = await probe.text();
    throw new Error(`OpenRouter API error: ${probe.status} - ${errorData}`);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages, temperature, apiKey } = body;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let streamResponse = await callOpenRouterStream(model, messages, temperature, apiKey);

        if (!streamResponse.ok) {
            const resolved = await resolveWorkingParams(model, messages, temperature, apiKey);
            streamResponse = await callOpenRouterStream(resolved.model, resolved.messages, temperature, apiKey);

            if (!streamResponse.ok) {
                const errorText = await streamResponse.text();
                return new Response(JSON.stringify({ error: `OpenRouter API error: ${streamResponse.status} - ${errorText}` }), {
                    status: streamResponse.status,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        if (!streamResponse.body) {
            return new Response(JSON.stringify({ error: 'No response body from upstream' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();

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
            cancel() {
                reader.cancel();
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Stream API error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
    }
}
