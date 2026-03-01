/* ===== TYPES ===== */

// ===== Chat Messages =====
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

// ===== ReAct Agent =====
export type ReActStepType = 'thought' | 'action' | 'observation' | 'final_answer';

export interface ReActStep {
    type: ReActStepType;
    content: string;
    toolName?: string;
    toolArgs?: Record<string, unknown>;
    timestamp: number;
}

export interface AgentResponse {
    steps: ReActStep[];
    finalAnswer: string;
    rawMessages: ChatMessage[];
}

// ===== Tool System =====
export interface ParameterDef {
    type: 'string' | 'number' | 'boolean' | 'object';
    description: string;
    required?: boolean;
}

export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, ParameterDef>;
    execute(args: Record<string, unknown>): Promise<string>;
}

// ===== Characters =====
export interface Character {
    name: string;
    description: string;
    relationship: string;
    traits: string[];
    speakingStyle: string;
    sherlockApproach: string;
}

// ===== Chats =====
export interface SavedChat {
    id: string;
    title: string;
    preview: string;
    character: string;
    created_at: string;
}

export interface FullChat extends SavedChat {
    full_content: string;
}

// ===== UI Message (extends ChatMessage with ReAct data) =====
export interface UIMessage {
    id: string;
    role: MessageRole;
    content: string;
    character?: string;
    reactSteps?: ReActStep[];
    timestamp: number;
}

// ===== Settings =====
export type ModelSource = 'openrouter' | 'local';

export type ModelStatus = 'not_loaded' | 'loading' | 'ready' | 'failed';

export interface OpenRouterModel {
    id: string;
    name: string;
}

export const AVAILABLE_MODELS: OpenRouterModel[] = [
    { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Meta Llama 3.1 8B Instruct (Free)' },
    { id: 'google/gemma-2-9b-it:free', name: 'Google Gemma 2 9B IT (Free)' },
    { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B Instruct (Free)' },
    { id: 'microsoft/phi-3-medium-128k-instruct:free', name: 'Microsoft PHI 3 Medium 128K Instruct (Free)' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (Free)' },
];

// ===== Auth =====
export interface User {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatar?: string;
}

export const AVATAR_OPTIONS = [
    { id: 'detective', label: 'Detective', src: '/avatars/detective.svg' },
    { id: 'man1', label: 'Gentleman', src: '/avatars/man1.svg' },
    { id: 'woman1', label: 'Lady', src: '/avatars/woman1.svg' },
    { id: 'man2', label: 'Scholar', src: '/avatars/man2.svg' },
    { id: 'woman2', label: 'Artist', src: '/avatars/woman2.svg' },
    { id: 'kid1', label: 'Prodigy', src: '/avatars/kid1.svg' },
    { id: 'scientist', label: 'Scientist', src: '/avatars/scientist.svg' },
    { id: 'ninja', label: 'Shadow', src: '/avatars/ninja.svg' },
    { id: 'elder', label: 'Elder', src: '/avatars/elder.svg' },
    { id: 'athlete', label: 'Athlete', src: '/avatars/athlete.svg' },
];

export interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
}
