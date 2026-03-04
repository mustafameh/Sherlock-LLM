'use client';

import { useEffect, useRef } from 'react';
import { deriveScenes, type StoryBlock } from '@/lib/shared/story/parser';
import type { DecisionFrequency } from '@/lib/client/contexts';

interface UseStoryPrefetchDeps {
    isStoryStarted: boolean;
    isStoryLoading: boolean;
    storyBlocks: StoryBlock[];
    currentSceneIndex: number;
    decisionFrequency: DecisionFrequency;
    zenMode: boolean;
    zenPaused: boolean;
    continueSilently: () => Promise<void>;
}

export function useStoryPrefetch(deps: UseStoryPrefetchDeps) {
    const {
        isStoryStarted, isStoryLoading, storyBlocks,
        currentSceneIndex, decisionFrequency, zenMode, zenPaused,
        continueSilently,
    } = deps;

    const prefetchKeyRef = useRef<string | null>(null);

    const resetPrefetchKey = () => { prefetchKeyRef.current = null; };

    useEffect(() => {
        if (!isStoryStarted || isStoryLoading || storyBlocks.length === 0) return;
        if (decisionFrequency === 'frequent' && !zenMode) return;
        if (zenMode && zenPaused) return;

        const scenes = deriveScenes(storyBlocks);
        const totalScenes = scenes.length;
        if (totalScenes < 2) return;

        const lastSceneBlocks = scenes[totalScenes - 1]?.blocks ?? [];
        const hasDecision = lastSceneBlocks.some(b => b.type === 'decision');
        if (hasDecision) { prefetchKeyRef.current = null; return; }

        const hasAwaitingInput = lastSceneBlocks.some(b => b.type === 'awaiting_input');
        if (hasAwaitingInput) { prefetchKeyRef.current = null; return; }

        const triggerIndex = zenMode
            ? totalScenes - 1
            : Math.max(0, totalScenes - 2);

        if (currentSceneIndex >= triggerIndex) {
            const prefetchKey = `${totalScenes}:${lastSceneBlocks.length}:${zenMode ? 'zen' : decisionFrequency}`;
            if (prefetchKeyRef.current === prefetchKey) return;
            prefetchKeyRef.current = prefetchKey;
            continueSilently();
        }
    }, [currentSceneIndex, isStoryStarted, isStoryLoading, storyBlocks, decisionFrequency, zenMode, zenPaused, continueSilently]);

    return { resetPrefetchKey };
}
