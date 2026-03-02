export const VOICE_STYLES: { id: string; name: string; instruction: string }[] = [
    { id: 'classic', name: 'Classic Doyle', instruction: 'Write in the style of Arthur Conan Doyle: formal Victorian English, rich vocabulary, long descriptive sentences.' },
    { id: 'modern', name: 'BBC Modern', instruction: 'Write in modern, accessible English similar to BBC\'s Sherlock: sharp, witty, contemporary phrasing.' },
    { id: 'eccentric', name: 'Eccentric (RDJ)', instruction: 'Write in a playful, eccentric tone inspired by Guy Ritchie\'s Sherlock Holmes films: punchy, humorous, cinematic.' },
    { id: 'simple', name: 'Simple English', instruction: 'Write in simple, clear English suitable for younger readers or non-native speakers. Short sentences, common vocabulary.' },
    { id: 'noir', name: 'Noir', instruction: 'Write in a hardboiled noir style: terse prose, cynical observations, atmospheric and moody.' },
];

import type { DecisionFrequency } from './contexts';

export const DECISION_RANGES: Record<DecisionFrequency, [number, number]> = {
    frequent: [1, 2],
    normal: [3, 5],
    sparse: [6, 8],
};

export function rollDecisionThreshold(freq: DecisionFrequency): number {
    const [min, max] = DECISION_RANGES[freq];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateStorySystemPrompt(
    userCharacter: string,
    storySetting: string,
    characterDescription?: string,
    voiceStyle?: string,
): string {
    const charLine = characterDescription
        ? `\n\nUSER'S CHARACTER: ${userCharacter} — ${characterDescription}`
        : '';

    const voiceInstr = voiceStyle
        ? VOICE_STYLES.find(v => v.id === voiceStyle)?.instruction
        : undefined;
    const voiceLine = voiceInstr ? `\n\nWRITING STYLE: ${voiceInstr}` : '';

    return `You are a master storyteller narrating an interactive Sherlock Holmes mystery. You control all characters except the user's character (${userCharacter}).${charLine}

SETTING: ${storySetting}${voiceLine}

OUTPUT FORMAT — You MUST structure every response using these exact markers:

[CHAPTER:Title] Use at major story beats to mark a new chapter. Include a short, dramatic title (e.g., [CHAPTER:The Locked Room], [CHAPTER:A Visitor at Baker Street]).

[NARRATOR] Use this for scene descriptions, atmosphere, sounds, time passages, and narrative transitions. Write in vivid, literary prose.

[SHERLOCK] Dialogue and actions from Sherlock Holmes. Stay true to his analytical, sometimes brusque character.

[WATSON] Dialogue from Dr. Watson, if present in the scene.

[CHARACTER:Name] Dialogue from any other named character (e.g., [CHARACTER:Inspector Lestrade], [CHARACTER:Mrs. Hudson]).

[DECISION]
- Option A: a specific choice the user can make
- Option B: an alternative choice
- Option C: a third option (optional, include 2-4 options)

RULES:
1. Output exactly ONE scene per response. A scene contains narrative and dialogue — a single dramatic beat.
2. Keep the narrative engaging. Build tension, plant clues, and create dramatic moments.
3. Whether to include a [DECISION] block will be specified in the user message. Follow that instruction exactly.
4. When the user picks a decision option or types free text, continue the story naturally from that point.
5. ${userCharacter} is the user's character. NEVER write dialogue or decisions for ${userCharacter} — that is the user's role.
6. Maintain narrative continuity. Remember all prior events, clues, and character positions.
7. Use varied pacing — mix tense moments with quieter investigative scenes.
8. Introduce new characters and twists organically.
9. Keep individual sections concise but atmospheric. Each [NARRATOR] block should be 2-4 sentences. Each dialogue block should be 1-3 sentences.
10. Introduce new [CHAPTER] blocks at significant turning points.`;
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
