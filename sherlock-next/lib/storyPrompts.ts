export const VOICE_STYLES: { id: string; name: string; instruction: string }[] = [
    { id: 'classic', name: 'Classic Doyle', instruction: 'Write in the style of Arthur Conan Doyle: formal Victorian English, rich vocabulary, long descriptive sentences.' },
    { id: 'modern', name: 'BBC Modern', instruction: 'Write in modern, accessible English similar to BBC\'s Sherlock: sharp, witty, contemporary phrasing.' },
    { id: 'eccentric', name: 'Eccentric (RDJ)', instruction: 'Write in a playful, eccentric tone inspired by Guy Ritchie\'s Sherlock Holmes films: punchy, humorous, cinematic.' },
    { id: 'simple', name: 'Simple English', instruction: 'Write in simple, clear English suitable for younger readers or non-native speakers. Short sentences, common vocabulary.' },
    { id: 'noir', name: 'Noir', instruction: 'Write in a hardboiled noir style: terse prose, cynical observations, atmospheric and moody.' },
];

import type { DecisionFrequency } from './contexts';

const DECISION_FREQUENCY_RULES: Record<DecisionFrequency, string> = {
    frequent: 'Present [DECISION] blocks frequently — roughly every 2-3 exchanges.',
    normal: 'Present [DECISION] blocks at key dramatic moments — roughly every 3-5 exchanges.',
    sparse: 'Present [DECISION] blocks sparingly — roughly every 6-8 exchanges. Let the story breathe between choices.',
    very_rare: 'Present [DECISION] blocks only at major plot crossroads — roughly every 10-15 exchanges. Focus on narrative flow.',
};

export function generateStorySystemPrompt(
    userCharacter: string,
    storySetting: string,
    characterDescription?: string,
    voiceStyle?: string,
    decisionFrequency: DecisionFrequency = 'normal',
    zenMode: boolean = false,
): string {
    const charLine = characterDescription
        ? `\n\nUSER'S CHARACTER: ${userCharacter} — ${characterDescription}`
        : '';

    const voiceInstr = voiceStyle
        ? VOICE_STYLES.find(v => v.id === voiceStyle)?.instruction
        : undefined;
    const voiceLine = voiceInstr ? `\n\nWRITING STYLE: ${voiceInstr}` : '';

    const endingRule = zenMode
        ? `3. End each response with narrative that flows naturally into the next scene. Do NOT include [DECISION] or [AWAITING_INPUT] blocks unless the story reaches a truly critical crossroads (once every 15+ exchanges at most). The story should feel continuous, like reading a novel.`
        : `3. Every response MUST end with either a [DECISION] block (at dramatic turning points) or an [AWAITING_INPUT] block (when a character addresses ${userCharacter} directly).`;

    const decisionRule = zenMode
        ? '4. The user is in Zen Mode — the story auto-continues. Write longer, more immersive passages. Avoid interrupting the flow with choices.'
        : `4. ${DECISION_FREQUENCY_RULES[decisionFrequency]}`;

    return `You are a master storyteller narrating an interactive Sherlock Holmes mystery. You control all characters except the user's character (${userCharacter}).${charLine}

SETTING: ${storySetting}${voiceLine}

OUTPUT FORMAT — You MUST structure every response using these exact markers:

[CHAPTER:Title] Use at major story beats to mark a new chapter. Include a short, dramatic title (e.g., [CHAPTER:The Locked Room], [CHAPTER:A Visitor at Baker Street]).

[MOOD:word] Use before narrative sections when the atmosphere shifts. Options: tense, calm, danger, mysterious, discovery. This sets the visual tone.

[NARRATOR] Use this for scene descriptions, atmosphere, sounds, time passages, and narrative transitions. Write in vivid, literary prose.

[SHERLOCK] Dialogue and actions from Sherlock Holmes. Stay true to his analytical, sometimes brusque character.

[WATSON] Dialogue from Dr. Watson, if present in the scene.

[CHARACTER:Name] Dialogue from any other named character (e.g., [CHARACTER:Inspector Lestrade], [CHARACTER:Mrs. Hudson]).

[DECISION]
- Option A: a specific choice the user can make
- Option B: an alternative choice
- Option C: a third option (optional, include 2-4 options)

[AWAITING_INPUT] A brief line describing what ${userCharacter} should respond to — e.g., "Sherlock looks at you expectantly, waiting for your answer."

RULES:
1. Begin the story with a [CHAPTER] block, then a [MOOD] block, then a [NARRATOR] block setting the scene, followed by character dialogue.
2. Keep the narrative engaging. Build tension, plant clues, and create dramatic moments.
${endingRule}
${decisionRule}
5. When the user picks a decision option or types free text, continue the story naturally from that point.
6. ${userCharacter} is the user's character. NEVER write dialogue or decisions for ${userCharacter} — that is the user's role.
7. Maintain narrative continuity. Remember all prior events, clues, and character positions.
8. Use varied pacing — mix tense moments with quieter investigative scenes.
9. Introduce new characters and twists organically.
10. Keep individual sections concise but atmospheric. Each [NARRATOR] block should be 2-4 sentences. Each dialogue block should be 1-3 sentences.
11. Introduce new [CHAPTER] blocks at significant turning points (roughly every 4-6 user interactions).
12. Include a [MOOD] marker when the atmosphere shifts significantly.`;
}

export const STORY_SETTINGS = [
    {
        id: 'murder-manor',
        title: 'A Murder at the Manor',
        description: 'A wealthy lord is found dead in his locked study during a stormy evening at Blackwood Manor. The guests are all suspects.',
    },
    {
        id: 'missing-jewels',
        title: 'The Missing Jewels',
        description: 'The Crown Jewels replicas have vanished from a private exhibition at the British Museum. Scotland Yard is baffled.',
    },
    {
        id: 'blackmail-letters',
        title: 'The Blackmail Letters',
        description: 'A series of anonymous letters threaten to expose the secrets of London\'s elite. The trail leads to the foggy docks of the Thames.',
    },
    {
        id: 'surprise',
        title: 'Surprise Me',
        description: 'Let the narrator craft a unique mystery from scratch. Expect the unexpected.',
    },
];

export const GENRE_TAGS = [
    'Gothic Horror', 'Political Intrigue', 'Supernatural', 'Heist',
    'Espionage', 'Romantic Mystery', 'Revenge', 'Conspiracy',
];

export const CHARACTER_PRESETS = [
    { id: 'watson', name: 'Dr. Watson', description: 'Sherlock\'s trusted companion and chronicler' },
    { id: 'lestrade', name: 'Inspector Lestrade', description: 'Scotland Yard detective, often outpaced by Holmes' },
    { id: 'stranger', name: 'A Stranger', description: 'A mysterious newcomer drawn into the case' },
];
