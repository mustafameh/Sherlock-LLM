'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { useStory } from '@/lib/storyContext';
import { useSettings } from '@/lib/contexts';
import { deriveScenes } from '@/lib/storyParser';
import styles from './Story.module.css';

const QUICK_ACTIONS = [
    { label: '👀 Look around', action: '*looks around the room carefully, taking in every detail*' },
    { label: '👂 Listen', action: '*listens carefully to the sounds around*' },
    { label: '🔍 Examine', action: '*examines the nearest object or clue more closely*' },
    { label: '🗣️ Ask Sherlock', action: 'Sherlock, what do you make of this?' },
];

export default function StoryInput() {
    const { sendStoryAction, selectDecision, isStoryLoading, userCharacter, storyBlocks, currentSceneIndex, zenPaused, setZenPaused } = useStory();
    const { zenMode } = useSettings();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scenes = useMemo(() => deriveScenes(storyBlocks), [storyBlocks]);
    const isOnLatest = currentSceneIndex >= scenes.length - 1;

    const currentBlocks = scenes[currentSceneIndex]?.blocks ?? [];
    const recentBlocks = currentBlocks.slice(-3);
    const decisionBlock = [...recentBlocks].reverse().find(b => b.type === 'decision');
    const isDecisionActive = !!decisionBlock && !isStoryLoading && isOnLatest;
    const decisionOptions = decisionBlock?.type === 'decision' ? decisionBlock.options : [];

    const handleSend = useCallback(async () => {
        const text = textareaRef.current?.value.trim();
        if (!text) return;
        if (textareaRef.current) textareaRef.current.value = '';
        if (zenMode && !zenPaused) setZenPaused(true);
        await sendStoryAction(text);
    }, [sendStoryAction, zenMode, zenPaused, setZenPaused]);

    const handleQuickAction = useCallback(async (action: string) => {
        if (zenMode && !zenPaused) setZenPaused(true);
        await sendStoryAction(action);
    }, [sendStoryAction, zenMode, zenPaused, setZenPaused]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    if (!isOnLatest) return null;

    const zenActive = zenMode && !zenPaused && !isDecisionActive;
    const showZenControls = zenMode && isOnLatest;

    return (
        <div className={styles.storyInputArea}>
            {showZenControls && (
                <div className={styles.zenBar}>
                    {zenActive && !isStoryLoading && (
                        <span className={styles.zenLabel}>Zen Mode — story will auto-continue</span>
                    )}
                    {zenActive && isStoryLoading && (
                        <span className={styles.zenLabel}>Zen Mode — writing next passage...</span>
                    )}
                    {zenPaused && (
                        <span className={styles.zenLabel}>Zen Mode paused</span>
                    )}
                    <button
                        className={styles.zenPauseBtn}
                        onClick={() => setZenPaused(!zenPaused)}
                    >
                        {zenPaused ? '▶ Resume' : '⏸ Pause'}
                    </button>
                </div>
            )}

            {isDecisionActive && decisionOptions.length > 0 && (
                <div className={styles.inlineDecision}>
                    <span className={styles.inlineDecisionLabel}>What will you do?</span>
                    <div className={styles.inlineDecisionOptions}>
                        {decisionOptions.map((opt, i) => (
                            <button
                                key={i}
                                className={styles.inlineDecisionBtn}
                                onClick={() => selectDecision(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <span className={styles.orDivider}>or type your own response below</span>
                </div>
            )}

            {(!zenActive || zenPaused || isDecisionActive) && (
                <>
                    <div className={styles.quickActions}>
                        {QUICK_ACTIONS.map((qa) => (
                            <button
                                key={qa.label}
                                className={styles.quickActionBtn}
                                onClick={() => handleQuickAction(qa.action)}
                                disabled={isStoryLoading}
                            >
                                {qa.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.storyInputRow}>
                        <textarea
                            ref={textareaRef}
                            className={styles.storyTextarea}
                            rows={1}
                            placeholder={isDecisionActive
                                ? `Or type what ${userCharacter} does instead...`
                                : `What does ${userCharacter} say or do?`
                            }
                            onKeyDown={handleKeyDown}
                            disabled={isStoryLoading}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = 'auto';
                                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                            }}
                        />
                        <button
                            className={styles.storySendBtn}
                            onClick={handleSend}
                            disabled={isStoryLoading}
                            title="Send"
                        >
                            ➤
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
