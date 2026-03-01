import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages, temperature, apiKey } = body;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();

            // Some providers (e.g. Google AI Studio) reject the "system" role.
            // Retry once with the system message folded into the first user message.
            const hasSystem = messages.some((m: { role: string }) => m.role === 'system');
            if (response.status === 400 && hasSystem) {
                const systemMsg = messages.find((m: { role: string }) => m.role === 'system');
                const rest = messages.filter((m: { role: string }) => m.role !== 'system');

                // Prepend system content to the first user message, or create one
                const firstUserIdx = rest.findIndex((m: { role: string }) => m.role === 'user');
                if (firstUserIdx !== -1) {
                    rest[firstUserIdx] = {
                        ...rest[firstUserIdx],
                        content: `[System Instructions]\n${systemMsg.content}\n\n[User Message]\n${rest[firstUserIdx].content}`,
                    };
                } else {
                    rest.unshift({ role: 'user', content: systemMsg.content });
                }

                const retry = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages: rest,
                        temperature,
                        max_tokens: 1000,
                    }),
                });

                if (retry.ok) {
                    const data = await retry.json();
                    return NextResponse.json(data);
                }

                const retryError = await retry.text();
                return NextResponse.json(
                    { error: `OpenRouter API error: ${retry.status} - ${retryError}` },
                    { status: retry.status }
                );
            }

            return NextResponse.json(
                { error: `OpenRouter API error: ${response.status} - ${errorData}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
