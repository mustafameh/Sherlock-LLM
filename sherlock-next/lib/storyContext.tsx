'use client';

import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useSettings } from '@/lib/contexts';
import { generateStorySystemPrompt } from '@/lib/storyPrompts';
import { parseStoryBlocks, type StoryBlock } from '@/lib/storyParser';
import type { ChatMessage } from '@/lib/types';

interface StoryContextType {
    storyBlocks: StoryBlock[];
    storyMessages: ChatMessage[];
    userCharacter: string;
    storySetting: string;
    isStoryLoading: boolean;
    storyError: string | null;
    isStoryStarted: boolean;
    sendStoryAction: (text: string) => Promise<void>;
    selectDecision: (optionText: string) => Promise<void>;
    startNewStory: (character: string, setting: string, settingTitle: string) => Promise<void>;
    resetStory: () => void;
    setStoryError: (err: string | null) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
    const { selectedModel, apiKey, temperature } = useSettings();
    const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);
    const [storyMessages, setStoryMessages] = useState<ChatMessage[]>([]);
    const [userCharacter, setUserCharacter] = useState('');
    const [storySetting, setStorySetting] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);
    const [storyError, setStoryError] = useState<string | null>(null);
    const [isStoryStarted, setIsStoryStarted] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

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
            sendStoryAction,
            selectDecision,
            startNewStory,
            resetStory,
            setStoryError,
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
