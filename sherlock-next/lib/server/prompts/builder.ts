import 'server-only';
import { render } from './renderer';
import roleplayData from './roleplay.yaml';
import storyData from './story.yaml';
import storyGenerateData from './story-generate.yaml';

const rp = roleplayData as Record<string, string>;
const st = storyData as Record<string, string>;
const sg = storyGenerateData as Record<string, string>;

export interface RoleplayPromptParams {
    type: 'roleplay';
    characterName?: string;
    characterDescription?: string;
    characterRelationship?: string;
    characterTraits?: string;
    characterSpeakingStyle?: string;
    characterSherlockApproach?: string;
    context?: string;
    deepReasoning: boolean;
    toolDescriptions?: string;
}

export interface StoryPromptParams {
    type: 'story';
    userCharacter: string;
    storySetting: string;
    characterDescription?: string;
    voiceStyle?: string;
    isMultiScene: boolean;
    rules34: string;
}

export interface StoryGeneratePromptParams {
    type: 'story-generate';
    genres: string;
    hint: string;
}

export type PromptParams = RoleplayPromptParams | StoryPromptParams | StoryGeneratePromptParams;

export function buildSystemPrompt(params: PromptParams): string {
    switch (params.type) {
        case 'roleplay':
            return buildRoleplayPrompt(params);
        case 'story':
            return buildStoryPrompt(params);
        case 'story-generate':
            return buildStoryGeneratePrompt(params);
    }
}

function buildRoleplayPrompt(params: RoleplayPromptParams): string {
    let message = rp.persona;

    if (params.context) {
        message += ` Context: ${params.context}`;
    }

    message += ' ' + render(rp.characterBlock, {
        character: params.characterName ? {
            name: params.characterName,
            description: params.characterDescription || '',
            relationship: params.characterRelationship || '',
            traits: params.characterTraits || '',
            speakingStyle: params.characterSpeakingStyle || '',
            sherlockApproach: params.characterSherlockApproach || '',
        } : null,
    });

    if (!params.deepReasoning) {
        message += '\n\n' + rp.directResponse;
    } else if (params.toolDescriptions) {
        message += '\n\n' + render(rp.reactWithTools, { toolDescriptions: params.toolDescriptions });
    } else {
        message += '\n\n' + rp.reactNoTools;
    }

    return message;
}

function buildStoryPrompt(params: StoryPromptParams): string {
    return render(st.template, {
        userCharacter: params.userCharacter,
        storySetting: params.storySetting,
        characterDescription: params.characterDescription || '',
        voiceStyle: params.voiceStyle || '',
        isMultiScene: params.isMultiScene,
        rules34: params.rules34,
    });
}

function buildStoryGeneratePrompt(params: StoryGeneratePromptParams): string {
    return render(sg.template, {
        genres: params.genres,
        hint: params.hint,
    });
}
