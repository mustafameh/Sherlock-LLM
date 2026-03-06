'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useSettings, useAuth } from '@/lib/client/contexts';
import { getBatchSize, VOICE_STYLES } from '@/lib/shared/story/prompts';
import { parseStoryBlocks, type StoryBlock } from '@/lib/shared/story/parser';
import type { ChatMessage } from '@/lib/shared/types';
import { streamStoryApi as doStreamStoryApi } from './streamStoryApi';
import { useStorySave, type SavedStorySummary } from './useStorySave';
import { useStoryPrefetch } from './useStoryPrefetch';

interface StoryContextType {
    storyBlocks: StoryBlock[];
    storyMessages: ChatMessage[];
    userCharacter: string;
    storySetting: string;
    storyVoiceStyle: string;
    storyCharacterDescription: string;
    isStoryLoading: boolean;
    storyError: string | null;
    isStoryStarted: boolean;
    currentStoryId: string | null;
    savedStories: SavedStorySummary[];
    streamingHint: string | null;
    currentSceneIndex: number;
    currentMood: string;
    zenPaused: boolean;
    setZenPaused: (paused: boolean) => void;
    setCurrentSceneIndex: (i: number) => void;
    sendStoryAction: (text: string) => Promise<void>;
    selectDecision: (optionText: string) => Promise<void>;
    startNewStory: (character: string, setting: string, settingTitle: string, characterDescription?: string, voiceStyle?: string) => Promise<void>;
    loadStory: (id: string) => Promise<void>;
    resetStory: () => void;
    setStoryError: (err: string | null) => void;
    refreshSavedStories: () => Promise<void>;
    deleteStory: (id: string) => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
    const { selectedModel, apiKey, temperature, decisionFrequency, zenMode } = useSettings();
    const { isLoggedIn } = useAuth();

    const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);
    const [storyMessages, setStoryMessages] = useState<ChatMessage[]>([]);
    const [userCharacter, setUserCharacter] = useState('');
    const [storySetting, setStorySetting] = useState('');
    const [storySettingDescription, setStorySettingDescription] = useState('');
    const [storyVoiceStyle, setStoryVoiceStyle] = useState('');
    const [storyCharacterDescription, setStoryCharacterDescription] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);
    const [storyError, setStoryError] = useState<string | null>(null);
    const [isStoryStarted, setIsStoryStarted] = useState(false);
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
    const [streamingHint, setStreamingHint] = useState<string | null>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [currentMood, setCurrentMood] = useState('calm');
    const [zenPaused, setZenPaused] = useState(false);

    const abortRef = useRef<AbortController | null>(null);
    const prefetchingRef = useRef(false);
    const prefetchKeyRef = useRef<string | null>(null);

    const { savedStories, refreshSavedStories, loadStory, deleteStory, clearSaveState } = useStorySave({
        storyMessages, storyBlocks, userCharacter, storySetting,
        storySettingDescription, storyVoiceStyle, storyCharacterDescription,
        currentStoryId, setCurrentStoryId,
        isLoggedIn, isStoryStarted,
        setStoryMessages, setStoryBlocks, setUserCharacter, setStorySetting,
        setStorySettingDescription, setStoryVoiceStyle, setStoryCharacterDescription,
        setIsStoryStarted, setIsStoryLoading, setStoryError,
        abortRef, prefetchKeyRef,
    });

    useEffect(() => {
        const lastMood = [...storyBlocks].reverse().find(b => b.type === 'mood');
        if (lastMood && lastMood.type === 'mood') setCurrentMood(lastMood.mood);
    }, [storyBlocks]);

    const buildCurrentPromptParams = useCallback(() => {
        const batchSize = getBatchSize(decisionFrequency, zenMode);
        const isMultiScene = batchSize > 1;
        const voiceInstr = storyVoiceStyle
            ? VOICE_STYLES.find(v => v.id === storyVoiceStyle)?.instruction || ''
            : '';

        let rules34: string;
        if (!isMultiScene) {
            rules34 = `3. Every response MUST end with either a [DECISION] block (at dramatic turning points) or an [AWAITING_INPUT] block (when a character addresses ${userCharacter} directly).\n4. Present [DECISION] blocks at key dramatic moments.`;
        } else if (zenMode) {
            rules34 = `3. Output approximately ${batchSize} scenes of narrative per response, separated by [SCENE_BREAK] markers. Each scene should be a self-contained dramatic beat with its own [NARRATOR] and dialogue blocks.\n4. Do NOT include [DECISION] or [AWAITING_INPUT] blocks. End with narrative that flows naturally. The story should read like a novel.`;
        } else {
            rules34 = `3. Output approximately ${batchSize} scenes of narrative per response, separated by [SCENE_BREAK] markers. Each scene should be a self-contained dramatic beat with its own [NARRATOR] and dialogue blocks.\n4. End the FINAL scene with EITHER a [DECISION] block (at dramatic turning points) OR an [AWAITING_INPUT] block (when a character addresses ${userCharacter} directly). Do NOT place [DECISION] or [AWAITING_INPUT] blocks between scenes.`;
        }

        return {
            type: 'story' as const,
            userCharacter,
            storySetting: storySettingDescription,
            characterDescription: storyCharacterDescription,
            voiceStyle: voiceInstr,
            isMultiScene,
            rules34,
        };
    }, [userCharacter, storySettingDescription, storyVoiceStyle, storyCharacterDescription, decisionFrequency, zenMode]);

    const callStream = useCallback(async (
        messages: ChatMessage[],
        baseBlocks: StoryBlock[],
    ): Promise<string> => {
        const promptParams = buildCurrentPromptParams();
        return doStreamStoryApi(messages, baseBlocks, {
            selectedModel, apiKey, temperature,
            signal: abortRef.current?.signal,
            onBlocksUpdate: setStoryBlocks,
            onStreamingHint: setStreamingHint,
            promptParams,
        });
    }, [selectedModel, apiKey, temperature, buildCurrentPromptParams]);

    const startNewStory = useCallback(async (character: string, setting: string, settingTitle: string, characterDescription?: string, voiceStyle?: string) => {
        setStoryError(null);
        setIsStoryLoading(true);
        setUserCharacter(character);
        setStorySetting(settingTitle);
        setStorySettingDescription(setting);
        setStoryVoiceStyle(voiceStyle || '');
        setStoryCharacterDescription(characterDescription || '');
        setStoryBlocks([]);
        setCurrentStoryId(null);
        setCurrentMood('calm');
        prefetchKeyRef.current = null;
        clearSaveState();
        abortRef.current = new AbortController();

        const charIntro = characterDescription
            ? `Begin the story. Set the scene and introduce the first situation. I am playing as ${character} (${characterDescription}).`
            : `Begin the story. Set the scene and introduce the first situation. Remember, I am playing as ${character}.`;
        const initialMessages: ChatMessage[] = [{ role: 'user', content: charIntro }];

        try {
            const response = await callStream(initialMessages, []);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            setStoryMessages([...initialMessages, assistantMsg]);
            setIsStoryStarted(true);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to start story');
            }
        } finally {
            setIsStoryLoading(false);
            setStreamingHint(null);
        }
    }, [callStream, clearSaveState]);

    const sendStoryAction = useCallback(async (text: string) => {
        if (isStoryLoading || !text.trim()) return;
        setStoryError(null);
        setIsStoryLoading(true);
        prefetchKeyRef.current = null;
        abortRef.current = new AbortController();

        const userActionBlock: StoryBlock = { type: 'user_action', content: text };
        const blocksBeforeStream = [...storyBlocks, userActionBlock];
        setStoryBlocks(blocksBeforeStream);

        const userMsg: ChatMessage = { role: 'user', content: text };
        const newMessages = [...storyMessages, userMsg];
        setStoryMessages(newMessages);

        try {
            const response = await callStream(newMessages, blocksBeforeStream);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            setStoryMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to continue story');
            }
            setStoryMessages(prev => prev.filter(m => m !== userMsg));
            setStoryBlocks(prev => {
                const idx = prev.findIndex(b => b === userActionBlock);
                if (idx >= 0) return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                return prev;
            });
        } finally {
            setIsStoryLoading(false);
            setStreamingHint(null);
        }
    }, [isStoryLoading, storyMessages, storyBlocks, callStream]);

    const continueSilently = useCallback(async () => {
        if (isStoryLoading || prefetchingRef.current) return;
        prefetchingRef.current = true;
        setStoryError(null);
        setIsStoryLoading(true);
        abortRef.current = new AbortController();

        const continueMsg: ChatMessage = { role: 'user', content: 'Continue the story.' };
        const messagesForApi = [...storyMessages, continueMsg];

        try {
            const response = await callStream(messagesForApi, storyBlocks);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            setStoryMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to continue story');
            }
            prefetchKeyRef.current = null;
        } finally {
            setIsStoryLoading(false);
            setStreamingHint(null);
            prefetchingRef.current = false;
        }
    }, [isStoryLoading, storyMessages, storyBlocks, callStream]);

    useStoryPrefetch({
        isStoryStarted, isStoryLoading, storyBlocks,
        currentSceneIndex, decisionFrequency, zenMode, zenPaused,
        continueSilently,
    });

    const selectDecision = useCallback(async (optionText: string) => {
        const cleaned = optionText.replace(/^Option\s+[A-Z]:\s*/i, '').trim();
        await sendStoryAction(cleaned);
    }, [sendStoryAction]);

    const resetStory = useCallback(() => {
        abortRef.current?.abort();
        prefetchingRef.current = false;
        prefetchKeyRef.current = null;
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
        setStreamingHint(null);
        setZenPaused(false);
        clearSaveState();
    }, [clearSaveState]);

    return (
        <StoryContext.Provider value={{
            storyBlocks, storyMessages, userCharacter, storySetting,
            storyVoiceStyle, storyCharacterDescription,
            isStoryLoading, storyError, isStoryStarted, currentStoryId,
            savedStories, streamingHint, currentSceneIndex, currentMood,
            zenPaused, setZenPaused, setCurrentSceneIndex,
            sendStoryAction, selectDecision, startNewStory,
            loadStory, resetStory, setStoryError,
            refreshSavedStories, deleteStory,
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
