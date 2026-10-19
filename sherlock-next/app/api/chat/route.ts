import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, type PromptParams } from '@/lib/server/prompts/builder';
import type { ChatMessage } from '@/lib/server/chat-utils';
import { readUsage, requestCompletion } from '@/lib/server/openrouter';
import { sanitizeTrialMessages, startTrialRequest, trialUpstreamError } from '@/lib/server/trial';

const MAX_TOKENS = 1000;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages: rawMessages, temperature, apiKey, promptParams } = body;
        // Without a key of their own, visitors play on the free trial (the app's key, metered).
        const onTrial = !apiKey;

        if (onTrial && !promptParams) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        let messages: ChatMessage[] = onTrial ? sanitizeTrialMessages(rawMessages) : rawMessages;
        if (promptParams) {
            const systemPrompt = buildSystemPrompt(promptParams as PromptParams);
            const hasSystem = messages.some((m: ChatMessage) => m.role === 'system');
            if (!hasSystem) {
                messages = [{ role: 'system', content: systemPrompt }, ...messages];
            }
        }

        if (!onTrial) {
            const response = await requestCompletion(apiKey, { model, messages, temperature, maxTokens: MAX_TOKENS });
            if (!response.ok) {
                const errorData = await response.text();
                return NextResponse.json(
                    { error: `OpenRouter API error: ${response.status} - ${errorData}` },
                    { status: response.status }
                );
            }
            return NextResponse.json(await response.json());
        }

        const admitted = await startTrialRequest(request, messages, MAX_TOKENS);
        if ('response' in admitted) return admitted.response;
        const { trial } = admitted;

        const response = await requestCompletion(trial.apiKey, {
            model: trial.model, messages, temperature, maxTokens: MAX_TOKENS,
        });
        if (!response.ok) return trialUpstreamError(trial, response);

        const data = await response.json();
        await trial.finish(readUsage(data), data.choices?.[0]?.message?.content ?? '');
        return trial.withCookie(NextResponse.json(data));
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
