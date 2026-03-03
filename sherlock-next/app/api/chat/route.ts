import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, type PromptParams } from '@/lib/prompts/builder';

interface ChatMessage {
    role: string;
    content: string;
}

async function callOpenRouter(
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
        body: JSON.stringify({ model, messages, temperature, max_tokens: 1000 }),
    });
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages: rawMessages, temperature, apiKey, promptParams } = body;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        let messages: ChatMessage[] = rawMessages;
        if (promptParams) {
            const systemPrompt = buildSystemPrompt(promptParams as PromptParams);
            const hasSystem = messages.some((m: ChatMessage) => m.role === 'system');
            if (!hasSystem) {
                messages = [{ role: 'system', content: systemPrompt }, ...messages];
            }
        }

        let response = await callOpenRouter(model, messages, temperature, apiKey);

        // 429 on a :free model → retry with the paid variant (uses account credits)
        if (response.status === 429 && model.endsWith(':free')) {
            const paidModel = model.replace(/:free$/, '');
            response = await callOpenRouter(paidModel, messages, temperature, apiKey);

            // If paid variant also fails with 400 (system role), fold and retry
            if (response.status === 400 && messages.some((m: ChatMessage) => m.role === 'system')) {
                response = await callOpenRouter(paidModel, foldSystemIntoUser(messages), temperature, apiKey);
            }

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
        }

        // 400 with system message → fold system into user and retry same model
        if (response.status === 400 && messages.some((m: ChatMessage) => m.role === 'system')) {
            response = await callOpenRouter(model, foldSystemIntoUser(messages), temperature, apiKey);

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
        }

        if (!response.ok) {
            const errorData = await response.text();
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
