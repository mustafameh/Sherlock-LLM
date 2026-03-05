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
    { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 Llama 405B (Free, 131K ctx)' },
    { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B (Free, 262K ctx)' },
    { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B (Free, 262K ctx)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free, 128K ctx)' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 30B (Free, 256K ctx)' },
    { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free, 131K ctx)' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 24B (Free, 128K ctx)' },
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2' },
    { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast' },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B Instruct (Free, 131K ctx)' },
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
