'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StoryBlock } from '@/lib/shared/story/parser';
import type { ChatMessage } from '@/lib/shared/types';

export interface SavedStorySummary {
    id: string;
    title: string;
    character: string;
    created_at: string;
}

interface UseStorySaveDeps {
    storyMessages: ChatMessage[];
    storyBlocks: StoryBlock[];
    userCharacter: string;
    storySetting: string;
    storySettingDescription: string;
    storyVoiceStyle: string;
    storyCharacterDescription: string;
    currentStoryId: string | null;
    setCurrentStoryId: (id: string | null) => void;
    isLoggedIn: boolean;
    isStoryStarted: boolean;
    setStoryMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setStoryBlocks: React.Dispatch<React.SetStateAction<StoryBlock[]>>;
    setUserCharacter: (c: string) => void;
    setStorySetting: (s: string) => void;
    setStorySettingDescription: (d: string) => void;
    setStoryVoiceStyle: (v: string) => void;
    setStoryCharacterDescription: (d: string) => void;
    setIsStoryStarted: (b: boolean) => void;
    setIsStoryLoading: (b: boolean) => void;
    setStoryError: (e: string | null) => void;
    abortRef: React.RefObject<AbortController | null>;
    prefetchKeyRef: React.MutableRefObject<string | null>;
}

export function useStorySave(deps: UseStorySaveDeps) {
    const {
        storyMessages, storyBlocks, userCharacter, storySetting,
        storySettingDescription, storyVoiceStyle, storyCharacterDescription,
        currentStoryId, setCurrentStoryId,
        isLoggedIn, isStoryStarted,
        setStoryMessages, setStoryBlocks, setUserCharacter, setStorySetting,
        setStorySettingDescription, setStoryVoiceStyle, setStoryCharacterDescription,
        setIsStoryStarted, setIsStoryLoading, setStoryError,
        abortRef, prefetchKeyRef,
    } = deps;

    const [savedStories, setSavedStories] = useState<SavedStorySummary[]>([]);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');
    const savingRef = useRef(false);

    const refreshSavedStories = useCallback(async () => {
        if (!isLoggedIn) { setSavedStories([]); return; }
        try {
            const res = await fetch('/api/chats?type=story');
            if (res.ok) setSavedStories(await res.json());
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
            settingDescription: storySettingDescription,
            voiceStyle: storyVoiceStyle,
            characterDescription: storyCharacterDescription,
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
                    title, preview, full_content: fullContent,
                    character: userCharacter, chat_type: 'story',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (!currentStoryId && data.id) setCurrentStoryId(data.id);
                lastSavedRef.current = fullContent;
                refreshSavedStories();
            }
        } catch { /* ignore */ } finally {
            savingRef.current = false;
        }
    }, [storyMessages, storyBlocks, userCharacter, storySetting, storySettingDescription, storyVoiceStyle, storyCharacterDescription, currentStoryId, isLoggedIn, isStoryStarted, setCurrentStoryId, refreshSavedStories]);

    useEffect(() => {
        if (!isLoggedIn || !isStoryStarted || storyMessages.length === 0) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => { saveStory(); }, 3000);
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [storyMessages, isLoggedIn, isStoryStarted, saveStory]);

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
            setStorySettingDescription(saved.settingDescription || saved.storySetting || '');
            setStoryVoiceStyle(saved.voiceStyle || '');
            setStoryCharacterDescription(saved.characterDescription || '');
            setCurrentStoryId(id);
            prefetchKeyRef.current = null;
            lastSavedRef.current = data.full_content;
            setIsStoryStarted(true);
        } catch (err) {
            setStoryError(err instanceof Error ? err.message : 'Failed to load story');
        } finally {
            setIsStoryLoading(false);
        }
    }, [setStoryMessages, setStoryBlocks, setUserCharacter, setStorySetting, setStorySettingDescription, setStoryVoiceStyle, setStoryCharacterDescription, setCurrentStoryId, setIsStoryStarted, setIsStoryLoading, setStoryError, prefetchKeyRef]);

    const deleteStory = useCallback(async (id: string) => {
        try {
            await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (currentStoryId === id) {
                abortRef.current?.abort();
                setStoryBlocks([]);
                setStoryMessages([]);
                setUserCharacter('');
                setStorySetting('');
                setStorySettingDescription('');
                setStoryVoiceStyle('');
                setStoryCharacterDescription('');
                setIsStoryStarted(false);
                setIsStoryLoading(false);
                setStoryError(null);
                setCurrentStoryId(null);
                lastSavedRef.current = '';
            }
            refreshSavedStories();
        } catch { /* ignore */ }
    }, [currentStoryId, refreshSavedStories, abortRef, setStoryBlocks, setStoryMessages, setUserCharacter, setStorySetting, setStorySettingDescription, setStoryVoiceStyle, setStoryCharacterDescription, setIsStoryStarted, setIsStoryLoading, setStoryError, setCurrentStoryId]);

    const clearSaveState = useCallback(() => {
        lastSavedRef.current = '';
    }, []);

    return { savedStories, refreshSavedStories, loadStory, deleteStory, clearSaveState };
}
