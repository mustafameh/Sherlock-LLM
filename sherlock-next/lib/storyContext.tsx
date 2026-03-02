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
    streamingHint: string | null;
    currentSceneIndex: number;
    setCurrentSceneIndex: (i: number) => void;
    sendStoryAction: (text: string) => Promise<void>;
    selectDecision: (optionText: string) => Promise<void>;
    startNewStory: (character: string, setting: string, settingTitle: string, characterDescription?: string) => Promise<void>;
    loadStory: (id: string) => Promise<void>;
    resetStory: () => void;
    setStoryError: (err: string | null) => void;
    refreshSavedStories: () => Promise<void>;
    deleteStory: (id: string) => Promise<void>;
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
    const [streamingHint, setStreamingHint] = useState<string | null>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
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

    const deriveStreamingHint = useCallback((buffer: string): string => {
        const markerMatch = buffer.match(/\[(NARRATOR|SHERLOCK|WATSON|CHARACTER:([^\]]+)|DECISION|AWAITING_INPUT)\]\s*$/);
        if (markerMatch) {
            const tag = markerMatch[1];
            if (tag === 'NARRATOR') return 'Narrating';
            if (tag === 'SHERLOCK') return 'Sherlock Holmes speaking';
            if (tag === 'WATSON') return 'Dr. Watson speaking';
            if (tag.startsWith('CHARACTER:')) return `${markerMatch[2]?.trim()} speaking`;
            if (tag === 'DECISION') return 'Presenting choices';
            if (tag === 'AWAITING_INPUT') return 'Waiting for your response';
        }
        const trailingMarker = buffer.match(/\[([A-Z_:]+[^\]]*?)$/);
        if (trailingMarker) return 'The story continues';
        return 'The story continues';
    }, []);

    const streamStoryApi = useCallback(async (
        messages: ChatMessage[],
        baseBlocks: StoryBlock[],
    ): Promise<string> => {
        if (!apiKey) throw new Error('Please set your OpenRouter API key first.');

        const res = await fetch('/api/chat/stream', {
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

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let lastBlockCount = 0;
        let lastUpdateTime = 0;
        const THROTTLE_MS = 80;

        setStreamingHint('The story continues');

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const payload = line.slice(6).trim();
                    if (payload === '[DONE]') continue;

                    try {
                        const json = JSON.parse(payload);
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            buffer += delta;

                            const parsed = parseStoryBlocks(buffer);
                            const now = Date.now();
                            const newBlockAppeared = parsed.length > lastBlockCount;

                            if (newBlockAppeared) {
                                const newBlocks = parsed.slice(lastBlockCount);
                                setStoryBlocks([...baseBlocks, ...parsed]);
                                lastBlockCount = parsed.length;
                                lastUpdateTime = now;

                                const lastNew = newBlocks[newBlocks.length - 1];
                                if (lastNew.type === 'narrator') setStreamingHint('Narrating');
                                else if (lastNew.type === 'dialogue') setStreamingHint(`${lastNew.character} speaking`);
                            } else if (now - lastUpdateTime >= THROTTLE_MS) {
                                setStoryBlocks([...baseBlocks, ...parsed]);
                                lastUpdateTime = now;
                            }

                            setStreamingHint(deriveStreamingHint(buffer));
                        }
                    } catch { /* skip malformed SSE lines */ }
                }
            }
        } finally {
            reader.releaseLock();
        }

        const finalBlocks = parseStoryBlocks(buffer);
        setStoryBlocks([...baseBlocks, ...finalBlocks]);
        setStreamingHint(null);

        return buffer;
    }, [selectedModel, apiKey, temperature, deriveStreamingHint]);

    const startNewStory = useCallback(async (character: string, setting: string, settingTitle: string, characterDescription?: string) => {
        setStoryError(null);
        setIsStoryLoading(true);
        setUserCharacter(character);
        setStorySetting(settingTitle);
        setStoryBlocks([]);
        setCurrentStoryId(null);
        lastSavedRef.current = '';
        abortRef.current = new AbortController();

        const systemPrompt = generateStorySystemPrompt(character, setting, characterDescription);
        const charIntro = characterDescription
            ? `Begin the story. Set the scene and introduce the first situation. I am playing as ${character} (${characterDescription}).`
            : `Begin the story. Set the scene and introduce the first situation. Remember, I am playing as ${character}.`;
        const initialMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: charIntro },
        ];

        try {
            const response = await streamStoryApi(initialMessages, []);
            const assistantMsg: ChatMessage = { role: 'assistant', content: response };
            const newMessages = [...initialMessages, assistantMsg];
            setStoryMessages(newMessages);
            setIsStoryStarted(true);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setStoryError(err instanceof Error ? err.message : 'Failed to start story');
            }
        } finally {
            setIsStoryLoading(false);
            setStreamingHint(null);
        }
    }, [streamStoryApi]);

    const loadStory = useCallback(async (id: string) => {
        setStoryError(null);
        setIsStoryLoading(true);
        try {
            const res = await fetch(`/api/chats/${id}`);
            if (!res.ok) throw new Error('Failed to load story');
            const data = await res.json();
            const saved = JSON.parse(data.full_content);

            setStoryMessages(saved.messages || []);
            const blocks = saved.blocks || [];
            setStoryBlocks(blocks);
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

        const userActionBlock: StoryBlock = { type: 'user_action', content: text };
        const blocksBeforeStream = [...storyBlocks, userActionBlock];
        setStoryBlocks(blocksBeforeStream);

        const userMsg: ChatMessage = { role: 'user', content: text };
        const newMessages = [...storyMessages, userMsg];
        setStoryMessages(newMessages);

        try {
            const response = await streamStoryApi(newMessages, blocksBeforeStream);
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
    }, [isStoryLoading, storyMessages, storyBlocks, streamStoryApi]);

    const selectDecision = useCallback(async (optionText: string) => {
        const cleaned = optionText.replace(/^Option\s+[A-Z]:\s*/i, '').trim();
        await sendStoryAction(cleaned);
    }, [sendStoryAction]);

    const deleteStory = useCallback(async (id: string) => {
        try {
            await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (currentStoryId === id) {
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
            }
            refreshSavedStories();
        } catch { /* ignore */ }
    }, [currentStoryId, refreshSavedStories]);

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
        setStreamingHint(null);
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
            streamingHint,
            currentSceneIndex,
            setCurrentSceneIndex,
            sendStoryAction,
            selectDecision,
            startNewStory,
            loadStory,
            resetStory,
            setStoryError,
            refreshSavedStories,
            deleteStory,
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
