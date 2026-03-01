'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { UIMessage, Character, ModelSource, ModelStatus } from '@/lib/types';
import { DEFAULT_CHARACTERS } from '@/lib/characters';

// ===== Chat Context =====
interface ChatContextType {
    messages: UIMessage[];
    currentChatId: string | null;
    currentCharacter: Character | null;
    characters: Character[];
    context: string;
    isLoading: boolean;
    chatError: string | null;
    lastFailedText: string | null;
    addMessage: (msg: UIMessage) => void;
    setMessages: (msgs: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
    setCurrentChatId: (id: string | null) => void;
    setCurrentCharacter: (char: Character | null) => void;
    setCharacters: (chars: Character[]) => void;
    addCharacter: (char: Character) => void;
    setContext: (ctx: string) => void;
    setIsLoading: (loading: boolean) => void;
    setChatError: (err: string | null) => void;
    setLastFailedText: (text: string | null) => void;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(DEFAULT_CHARACTERS[0]);
    const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [lastFailedText, setLastFailedText] = useState<string | null>(null);

    const addMessage = useCallback((msg: UIMessage) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const addCharacter = useCallback((char: Character) => {
        setCharacters(prev => [...prev, char]);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
    }, []);

    return (
        <ChatContext.Provider value={{
            messages, currentChatId, currentCharacter, characters, context, isLoading,
            chatError, lastFailedText,
            addMessage, setMessages, setCurrentChatId, setCurrentCharacter, setCharacters,
            addCharacter, setContext, setIsLoading, setChatError, setLastFailedText, clearChat,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}

// ===== Settings Context =====
type ApiKeyStorageMode = 'browser' | 'account';

interface SettingsContextType {
    modelSource: ModelSource;
    selectedModel: string;
    apiKey: string;
    temperature: number;
    deepReasoning: boolean;
    apiKeyStorage: ApiKeyStorageMode;
    localModelStatus: ModelStatus;
    showDebugWindow: boolean;
    setModelSource: (source: ModelSource) => void;
    setSelectedModel: (model: string) => void;
    setApiKey: (key: string) => void;
    setTemperature: (temp: number) => void;
    setDeepReasoning: (on: boolean) => void;
    setApiKeyStorage: (mode: ApiKeyStorageMode) => void;
    setLocalModelStatus: (status: ModelStatus) => void;
    setShowDebugWindow: (show: boolean) => void;
    saveApiKey: (key: string) => void;
    clearApiKey: () => void;
    saveModel: (model: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const [modelSource, setModelSource] = useState<ModelSource>('openrouter');
    const [selectedModel, setSelectedModel] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('SelectedModel') || 'nvidia/nemotron-3-nano-30b-a3b:free';
        }
        return 'nvidia/nemotron-3-nano-30b-a3b:free';
    });
    const [apiKey, setApiKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('APIKey') || '';
        }
        return '';
    });
    const [temperature, setTemperature] = useState(0.7);
    const [deepReasoning, setDeepReasoningState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('DeepReasoning');
            return stored === null ? true : stored === 'true';
        }
        return true;
    });
    const [apiKeyStorage, setApiKeyStorageState] = useState<ApiKeyStorageMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('ApiKeyStorage') as ApiKeyStorageMode) || 'browser';
        }
        return 'browser';
    });
    const [localModelStatus, setLocalModelStatus] = useState<ModelStatus>('not_loaded');
    const [showDebugWindow, setShowDebugWindow] = useState(false);
    const hydratedForUser = useRef<string | null>(null);

    const setDeepReasoning = useCallback((on: boolean) => {
        setDeepReasoningState(on);
        if (typeof window !== 'undefined') {
            localStorage.setItem('DeepReasoning', String(on));
        }
    }, []);

    const setApiKeyStorage = useCallback((mode: ApiKeyStorageMode) => {
        setApiKeyStorageState(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('ApiKeyStorage', mode);
        }
    }, []);

    const saveApiKey = useCallback(async (key: string) => {
        setApiKey(key);
        if (typeof window !== 'undefined') {
            localStorage.setItem('APIKey', key);
        }
        const currentStorageMode = typeof window !== 'undefined'
            ? (localStorage.getItem('ApiKeyStorage') as ApiKeyStorageMode) || 'browser'
            : 'browser';
        if (currentStorageMode === 'account') {
            try {
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: key }),
                });
            } catch { /* server sync failed silently */ }
        }
    }, []);

    const clearApiKey = useCallback(async () => {
        setApiKey('');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('APIKey');
        }
        const currentStorageMode = typeof window !== 'undefined'
            ? (localStorage.getItem('ApiKeyStorage') as ApiKeyStorageMode) || 'browser'
            : 'browser';
        if (currentStorageMode === 'account') {
            try {
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: null }),
                });
            } catch { /* server sync failed silently */ }
        }
    }, []);

    const saveModel = useCallback((model: string) => {
        setSelectedModel(model);
        if (typeof window !== 'undefined') {
            localStorage.setItem('SelectedModel', model);
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !user) {
            hydratedForUser.current = null;
            return;
        }
        if (hydratedForUser.current === user.id) return;
        hydratedForUser.current = user.id;

        (async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (!res.ok) return;
                const data = await res.json();
                if (data.hasServerApiKey && data.apiKey) {
                    const localKey = typeof window !== 'undefined' ? localStorage.getItem('APIKey') : '';
                    if (!localKey) {
                        setApiKey(data.apiKey);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('APIKey', data.apiKey);
                            localStorage.setItem('ApiKeyStorage', 'account');
                        }
                        setApiKeyStorageState('account');
                    }
                }
            } catch { /* hydration failed silently */ }
        })();
    }, [isLoggedIn, user]);

    return (
        <SettingsContext.Provider value={{
            modelSource, selectedModel, apiKey, temperature, deepReasoning, apiKeyStorage,
            localModelStatus, showDebugWindow,
            setModelSource, setSelectedModel, setApiKey, setTemperature, setDeepReasoning,
            setApiKeyStorage, setLocalModelStatus, setShowDebugWindow,
            saveApiKey, clearApiKey, saveModel,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}

// ===== Auth Context =====
interface AuthContextType {
    user: { id: string; username: string; email: string; displayName: string; avatar: string } | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateProfile: (displayName: string, avatar: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ id: string; username: string; email: string; displayName: string; avatar: string } | null>(null);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            if (data.logged_in) {
                setUser({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    displayName: data.displayName || data.username,
                    avatar: data.avatar || 'detective',
                });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                await checkAuth();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [checkAuth]);

    const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (data.success) {
                await checkAuth();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [checkAuth]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout');
            setUser(null);
        } catch {
            // ignore
        }
    }, []);

    const updateProfile = useCallback(async (displayName: string, avatar: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, avatar }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(prev => prev ? { ...prev, displayName: data.displayName, avatar: data.avatar } : null);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isLoggedIn: !!user, login, register, logout, checkAuth, updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
