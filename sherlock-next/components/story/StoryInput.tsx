'use client';

import React, { useRef, useCallback } from 'react';
import { useStory } from '@/lib/storyContext';
import styles from './Story.module.css';

const QUICK_ACTIONS = [
    { label: '👀 Look around', action: '*looks around the room carefully, taking in every detail*' },
    { label: '👂 Listen', action: '*listens carefully to the sounds around*' },
    { label: '🔍 Examine', action: '*examines the nearest object or clue more closely*' },
    { label: '🗣️ Ask Sherlock', action: 'Sherlock, what do you make of this?' },
];

export default function StoryInput() {
    const { sendStoryAction, selectDecision, isStoryLoading, userCharacter, storyBlocks } = useStory();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const recentBlocks = storyBlocks.slice(-3);
    const decisionBlock = recentBlocks.reverse().find(b => b.type === 'decision');
    const isDecisionActive = !!decisionBlock && !isStoryLoading;
    const decisionOptions = decisionBlock?.type === 'decision' ? decisionBlock.options : [];

    const handleSend = useCallback(async () => {
        const text = textareaRef.current?.value.trim();
        if (!text) return;
        if (textareaRef.current) textareaRef.current.value = '';
        await sendStoryAction(text);
    }, [sendStoryAction]);

    const handleQuickAction = useCallback(async (action: string) => {
        await sendStoryAction(action);
    }, [sendStoryAction]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.storyInputArea}>
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
        </div>
    );
}
