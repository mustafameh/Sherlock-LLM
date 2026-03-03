'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { ModelSource, ModelStatus } from '@/lib/shared/types';
import { useAuth } from './auth';

type ApiKeyStorageMode = 'browser' | 'account';

export type DecisionFrequency = 'frequent' | 'normal' | 'sparse' | 'very_rare';

interface SettingsContextType {
    modelSource: ModelSource;
    selectedModel: string;
    apiKey: string;
    temperature: number;
    deepReasoning: boolean;
    apiKeyStorage: ApiKeyStorageMode;
    decisionFrequency: DecisionFrequency;
    zenMode: boolean;
    localModelStatus: ModelStatus;
    showDebugWindow: boolean;
    setModelSource: (source: ModelSource) => void;
    setSelectedModel: (model: string) => void;
    setApiKey: (key: string) => void;
    setTemperature: (temp: number) => void;
    setDeepReasoning: (on: boolean) => void;
    setApiKeyStorage: (mode: ApiKeyStorageMode) => void;
    setDecisionFrequency: (freq: DecisionFrequency) => void;
    setZenMode: (on: boolean) => void;
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
    const [decisionFrequency, setDecisionFrequencyState] = useState<DecisionFrequency>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('DecisionFrequency') as DecisionFrequency) || 'normal';
        }
        return 'normal';
    });
    const [zenMode, setZenModeState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ZenMode') === 'true';
        }
        return false;
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

    const setDecisionFrequency = useCallback((freq: DecisionFrequency) => {
        setDecisionFrequencyState(freq);
        if (typeof window !== 'undefined') {
            localStorage.setItem('DecisionFrequency', freq);
        }
    }, []);

    const setZenMode = useCallback((on: boolean) => {
        setZenModeState(on);
        if (typeof window !== 'undefined') {
            localStorage.setItem('ZenMode', String(on));
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

    const saveModel = useCallback(async (model: string) => {
        setSelectedModel(model);
        if (typeof window !== 'undefined') {
            localStorage.setItem('SelectedModel', model);
        }
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedModel: model }),
            });
        } catch { /* server sync failed silently */ }
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
                const res = await fetch('/api/user/profile?hydrate=1');
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
                if (data.selectedModel) {
                    const localModel = typeof window !== 'undefined' ? localStorage.getItem('SelectedModel') : '';
                    if (!localModel) {
                        setSelectedModel(data.selectedModel);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('SelectedModel', data.selectedModel);
                        }
                    }
                }
            } catch { /* hydration failed silently */ }
        })();
    }, [isLoggedIn, user]);

    return (
        <SettingsContext.Provider value={{
            modelSource, selectedModel, apiKey, temperature, deepReasoning, apiKeyStorage,
            decisionFrequency, zenMode,
            localModelStatus, showDebugWindow,
            setModelSource, setSelectedModel, setApiKey, setTemperature, setDeepReasoning,
            setApiKeyStorage, setDecisionFrequency, setZenMode,
            setLocalModelStatus, setShowDebugWindow,
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
