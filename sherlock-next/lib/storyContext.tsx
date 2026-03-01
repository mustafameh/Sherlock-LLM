'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useSettings, useAuth } from '@/lib/contexts';
import { generateStorySystemPrompt } from '@/lib/storyPrompts';
import { parseStoryBlocks, type StoryBlock } from '@/lib/storyParser';
import type { ChatMessage } from '@/lib/types';

interface SavedStorySummary {
    id: string;
    title: string;
    character: string;
    created_at: string;
}

interface StoryContextType {
    storyBlocks: StoryBlock[];
    storyMessages: ChatMessage[];
    userCharacter: string;
    storySetting: string;
    isStoryLoading: boolean;
    storyError: string | null;
    isStoryStarted: boolean;
    currentStoryId: string | null;
    savedStories: SavedStorySummary[];
    sendStoryAction: (text: string) => Promise<void>;
    selectDecision: (optionText: string) => Promise<void>;
    startNewStory: (character: string, setting: string, settingTitle: string) => Promise<void>;
    loadStory: (id: string) => Promise<void>;
    resetStory: () => void;
    setStoryError: (err: string | null) => void;
    refreshSavedStories: () => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
    const { selectedModel, apiKey, temperature } = useSettings();
    const { isLoggedIn } = useAuth();
    const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);
    const [storyMessages, setStoryMessages] = useState<ChatMessage[]>([]);
    const [userCharacter, setUserCharacter] = useState('');
    const [storySetting, setStorySetting] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);
    const [storyError, setStoryError] = useState<string | null>(null);
    const [isStoryStarted, setIsStoryStarted] = useState(false);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
    const [savedStories, setSavedStories] = useState<SavedStorySummary[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');
    const savingRef = useRef(false);

    const refreshSavedStories = useCallback(async () => {
        if (!isLoggedIn) { setSavedStories([]); return; }
        try {
            const res = await fetch('/api/chats?type=story');
            if (res.ok) {
                const data = await res.json();
                setSavedStories(data);
            }
        } catch { /* ignore */ }
    }, [isLoggedIn]);

    useEffect(() => { refreshSavedStories(); }, [refreshSavedStories]);

    const saveStory = useCallback(async () => {
        if (savingRef.current || !isLoggedIn || !isStoryStarted) return;
        if (storyMessages.length === 0) return;

        const fullContent = JSON.stringify({
            messages: storyMessages,
            blocks: storyBlocks,
            userCharacter,
            storySetting,
        });

        if (fullContent === lastSavedRef.current) return;
        savingRef.current = true;

        const title = `${storySetting} — ${userCharacter}`;
        const lastNarrator = [...storyBlocks].reverse().find(b => b.type === 'narrator');
        const preview = lastNarrator && lastNarrator.type === 'narrator' ? lastNarrator.content.substring(0, 100) : '';

        try {
            const url = currentStoryId ? `/api/chats/${currentStoryId}` : '/api/chats';
            const method = currentStoryId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    preview,
                    full_content: fullContent,
                    character: userCharacter,
                    chat_type: 'story',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (!currentStoryId && data.id) {
                    setCurrentStoryId(data.id);
                }
                lastSavedRef.current = fullContent;
                refreshSavedStories();
            }
        } catch { /* ignore save errors */ } finally {
            savingRef.current = false;
        }
    }, [storyMessages, storyBlocks, userCharacter, storySetting, currentStoryId, isLoggedIn, isStoryStarted, refreshSavedStories]);

    useEffect(() => {
        if (!isLoggedIn || !isStoryStarted || storyMessages.length === 0) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => { saveStory(); }, 3000);
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [storyMessages, isLoggedIn, isStoryStarted, saveStory]);

    const callStoryApi = useCallback(async (messages: ChatMessage[]): Promise<string> => {
        if (!apiKey) throw new Error('Please set your OpenRouter API key first.');

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: selectedModel,
                messages,
                temperature,
                apiKey,
            }),
            signal: abortRef.current?.signal,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `API error ${res.status}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || data.response || '';
    }, [selectedModel, apiKey, temperature]);

    const startNewStory = useCallback(async (character: string, setting: string, settingTitle: string) => {
        setStoryError(null);
        setIsStoryLoading(true);
        setUserCharacter(character);
        setStorySetting(settingTitle);
        setStoryBlocks([]);
        setCurrentStoryId(null);
        lastSavedRef.current = '';
        abortRef.current = new AbortController();

        const systemPrompt = generateStorySystemPrompt(character, setting);
        const initialMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Begin the story. Set the scene and introduce the first situation. Remember, I am playing as ${character}.` },
        ];

        try {
            const response = await callStoryApi(initialMessages);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            const newMessages = [...initialMessages, assistantMsg];
            setStoryMessages(newMessages);

            const blocks = parseStoryBlocks(response);
            setStoryBlocks(blocks);
            setIsStoryStarted(true);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to start story');
            }
        } finally {
            setIsStoryLoading(false);
        }
    }, [callStoryApi]);

    const loadStory = useCallback(async (id: string) => {
        setStoryError(null);
        setIsStoryLoading(true);
        try {
            const res = await fetch(`/api/chats/${id}`);
            if (!res.ok) throw new Error('Failed to load story');
            const data = await res.json();
            const saved = JSON.parse(data.full_content);

            setStoryMessages(saved.messages || []);
            setStoryBlocks(saved.blocks || []);
            setUserCharacter(saved.userCharacter || data.character || '');
            setStorySetting(saved.storySetting || '');
            setCurrentStoryId(id);
            lastSavedRef.current = data.full_content;
            setIsStoryStarted(true);
        } catch (err) {
            setStoryError(err instanceof Error ? err.message : 'Failed to load story');
        } finally {
            setIsStoryLoading(false);
        }
    }, []);

    const sendStoryAction = useCallback(async (text: string) => {
        if (isStoryLoading || !text.trim()) return;
        setStoryError(null);
        setIsStoryLoading(true);
        abortRef.current = new AbortController();

        const userMsg: ChatMessage = { role: 'user', content: text };
        const newMessages = [...storyMessages, userMsg];
        setStoryMessages(newMessages);

        try {
            const response = await callStoryApi(newMessages);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            setStoryMessages(prev => [...prev, assistantMsg]);

            const blocks = parseStoryBlocks(response);
            setStoryBlocks(prev => [...prev, ...blocks]);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to continue story');
            }
            setStoryMessages(prev => prev.filter(m => m !== userMsg));
        } finally {
            setIsStoryLoading(false);
        }
    }, [isStoryLoading, storyMessages, callStoryApi]);

    const selectDecision = useCallback(async (optionText: string) => {
        await sendStoryAction(`I choose: ${optionText}`);
    }, [sendStoryAction]);

    const resetStory = useCallback(() => {
        abortRef.current?.abort();
        setStoryBlocks([]);
        setStoryMessages([]);
        setUserCharacter('');
        setStorySetting('');
        setIsStoryStarted(false);
        setIsStoryLoading(false);
        setStoryError(null);
        setCurrentStoryId(null);
        lastSavedRef.current = '';
    }, []);

    return (
        <StoryContext.Provider value={{
            storyBlocks,
            storyMessages,
            userCharacter,
            storySetting,
            isStoryLoading,
            storyError,
            isStoryStarted,
            currentStoryId,
            savedStories,
            sendStoryAction,
            selectDecision,
            startNewStory,
            loadStory,
            resetStory,
            setStoryError,
            refreshSavedStories,
        }}>
            {children}
        </StoryContext.Provider>
    );
}

export function useStory() {
    const ctx = useContext(StoryContext);
    if (!ctx) throw new Error('useStory must be used within StoryProvider');
    return ctx;
}
