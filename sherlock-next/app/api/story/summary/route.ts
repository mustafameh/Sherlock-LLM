import { NextRequest, NextResponse } from 'next/server';
import { decryptApiKey } from '@/lib/server/crypto';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { getUserFromSession } from '@/lib/server/auth';

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { currentStoryText, model } = body;

        if (!currentStoryText) {
            return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
        }

        // Try to get user's API key
        let apiKey: string | undefined = undefined;
        try {
            const userState = getUserFromSession(req);
            if (userState?.id) {
                await dbConnect();
                const userDoc = await User.findById(userState.id);
                if (userDoc?.apiKey) {
                    apiKey = decryptApiKey(userDoc.apiKey);
                }
            }
        } catch (e) {
            console.error('Failed to get user API key for summary:', e);
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'OpenRouter API key is required to generate a summary.' }, { status: 401 });
        }

        const openRouterModel = model || 'deepseek/deepseek-chat';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://sherlock-llm.com', // Required by OpenRouter
                'X-Title': 'Sherlock LLM',
            },
            body: JSON.stringify({
                model: openRouterModel,
                messages: [
                    { role: 'system', content: SUMMARY_PROMPT },
                    { role: 'user', content: `Here is the story history:\n\n${currentStoryText}\n\nPlease generate the "Story Thus Far" summary.` }
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            return NextResponse.json({ error: `API Error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        const summaryText = data.choices?.[0]?.message?.content || 'Failed to generate summary content.';

        return NextResponse.json({ summary: summaryText });
    } catch (error) {
        console.error('Error generating summary:', error);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
