import type { DecisionFrequency } from '@/lib/client/contexts';

export const VOICE_STYLES: { id: string; name: string; instruction: string }[] = [
    { id: 'classic', name: 'Classic Doyle', instruction: 'Write in the style of Arthur Conan Doyle: formal Victorian English, rich vocabulary, long descriptive sentences.' },
    { id: 'modern', name: 'BBC Modern', instruction: 'Write in modern, accessible English similar to BBC\'s Sherlock: sharp, witty, contemporary phrasing.' },
    { id: 'eccentric', name: 'Eccentric (RDJ)', instruction: 'Write in a playful, eccentric tone inspired by Guy Ritchie\'s Sherlock Holmes films: punchy, humorous, cinematic.' },
    { id: 'simple', name: 'Simple English', instruction: 'Write in simple, clear English suitable for younger readers or non-native speakers. Short sentences, common vocabulary.' },
    { id: 'noir', name: 'Noir', instruction: 'Write in a hardboiled noir style: terse prose, cynical observations, atmospheric and moody.' },
];

const BATCH_SIZES: Record<DecisionFrequency, number> = {
    frequent: 1,
    normal: 3,
    sparse: 5,
    very_rare: 8,
};

export function getBatchSize(freq: DecisionFrequency, zen: boolean): number {
    return zen ? 5 : BATCH_SIZES[freq];
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
    { id: 'irene', name: 'Irene Adler', description: '"The Woman" — brilliant, cunning, and always a step ahead of Holmes' },
    { id: 'hudson', name: 'Mrs. Hudson', description: 'The long-suffering and protective landlady of 221B Baker Street' },
    { id: 'stranger', name: 'A Stranger', description: 'A mysterious newcomer drawn into the case' },
];
