import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, type PromptParams } from '@/lib/server/prompts/builder';
import type { ChatMessage } from '@/lib/server/chat-utils';
import { pipeStream, requestCompletion } from '@/lib/server/openrouter';
import { sanitizeTrialMessages, startTrialRequest, trialUpstreamError } from '@/lib/server/trial';

// Node (not edge) so trial usage can be recorded in MongoDB; long stories need the extra time.
export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_TOKENS = 2000;

function jsonError(message: string, status: number): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, messages: rawMessages, temperature, apiKey, promptParams } = body;
        // Without a key of their own, visitors play on the free trial (the app's key, metered).
        const onTrial = !apiKey;

        if (onTrial && !promptParams) {
            return jsonError('API key is required', 400);
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
            const response = await requestCompletion(apiKey, {
                model, messages, temperature, maxTokens: MAX_TOKENS, stream: true,
            });
            if (!response.ok) {
                const errorText = await response.text();
                return jsonError(`OpenRouter API error: ${response.status} - ${errorText}`, response.status);
            }
            if (!response.body) return jsonError('No response body from upstream', 502);
            return pipeStream(response);
        }

        const admitted = await startTrialRequest(request, messages, MAX_TOKENS);
        if ('response' in admitted) return admitted.response;
        const { trial } = admitted;

        const response = await requestCompletion(trial.apiKey, {
            model: trial.model, providerSort: 'price', messages, temperature, maxTokens: MAX_TOKENS, stream: true,
        });
        if (!response.ok || !response.body) return trialUpstreamError(trial, response);

        const streamed = pipeStream(response, trial.finish);
        return trial.withCookie(new NextResponse(streamed.body, { headers: streamed.headers }));
    } catch (error) {
        console.error('Stream API error:', error);
        return jsonError(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}
