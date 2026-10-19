import { NextRequest, NextResponse } from 'next/server';
import { decryptApiKey } from '@/lib/server/crypto';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { getUserFromSession } from '@/lib/server/auth';
import type { ChatMessage } from '@/lib/server/chat-utils';
import { readUsage, requestCompletion } from '@/lib/server/openrouter';
import { startTrialRequest, trialUpstreamError } from '@/lib/server/trial';

const MAX_TOKENS = 1000;

const SUMMARY_PROMPT = `You are a meticulous archivist and storyteller. Review the current state of the story below and provide a concise "Story Thus Far" summary for the player who has been away.

Structure your response into the following exact sections with these exact headers:

### Current Situation
Where the player currently is, what is happening right now, and the immediate context. (2-3 sentences max)

### Key Characters Met
A bulleted list of the important characters encountered so far and a brief description of their role/status in the story.

### Clues & Evidence
A bulleted list of significant objects, clues, or information discovered.

### Major Decisions Made
A bulleted list of 2-4 important choices the player has explicitly made. Include only actual choices made, not trivial actions.

### Unresolved Questions
A bulleted list of 2-3 open mysteries or immediate questions the player needs to answer next.

Keep the tone atmospheric and engaging, but be direct and informative. Do not add any conversational preamble or outro. Only return the markdown structure requested.`;

/** The key the request should use: one sent by the browser, else one saved to the account. */
async function getOwnApiKey(req: NextRequest, bodyKey: unknown): Promise<string | undefined> {
    if (typeof bodyKey === 'string' && bodyKey) return bodyKey;
    try {
        const userState = getUserFromSession(req);
        if (userState?.id) {
            await dbConnect();
            const userDoc = await User.findById(userState.id);
            if (userDoc?.apiKey) return decryptApiKey(userDoc.apiKey);
        }
    } catch (e) {
        console.error('Failed to get user API key for summary:', e);
    }
    return undefined;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { currentStoryText, model } = body;

        if (!currentStoryText || typeof currentStoryText !== 'string') {
            return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
        }

        const messages: ChatMessage[] = [
            { role: 'system', content: SUMMARY_PROMPT },
            { role: 'user', content: `Here is the story history:\n\n${currentStoryText}\n\nPlease generate the "Story Thus Far" summary.` },
        ];

        const apiKey = await getOwnApiKey(req, body.apiKey);
        if (apiKey) {
            const response = await requestCompletion(apiKey, {
                model: model || 'deepseek/deepseek-chat', messages, temperature: 0.3, maxTokens: MAX_TOKENS,
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenRouter API error:', errorText);
                return NextResponse.json({ error: `API Error: ${response.status}` }, { status: response.status });
            }
            const data = await response.json();
            return NextResponse.json({ summary: data.choices?.[0]?.message?.content || 'Failed to generate summary content.' });
        }

        // No key of their own: summarise on the free trial.
        const admitted = await startTrialRequest(req, messages, MAX_TOKENS);
        if ('response' in admitted) return admitted.response;
        const { trial } = admitted;

        const response = await requestCompletion(trial.apiKey, {
            model: trial.model, messages, temperature: 0.3, maxTokens: MAX_TOKENS,
        });
        if (!response.ok) return trialUpstreamError(trial, response);

        const data = await response.json();
        const summaryText = data.choices?.[0]?.message?.content || '';
        await trial.finish(readUsage(data), summaryText);
        return trial.withCookie(NextResponse.json({ summary: summaryText || 'Failed to generate summary content.' }));
    } catch (error) {
        console.error('Error generating summary:', error);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
