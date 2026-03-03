/**
 * AI Mystery Generation Prompt
 * Used by: /api/chat (via app/story/page.tsx SetupScreen handleGenerate)
 * Variables: genres, hint
 */

export const meta = {
    name: 'story-generate',
    description: 'Generate a Sherlock Holmes mystery premise from genre tags and user hint',
    usedBy: '/api/chat',
};

export const template = `\
Generate a Sherlock Holmes mystery premise. Genre: {{ genres }}. Additional idea: {{ hint }}.
Return ONLY a valid JSON object with two fields: "title" (short, dramatic title) and "description" (2-3 sentences setting the scene). No markdown, no code fences, just raw JSON.`;
