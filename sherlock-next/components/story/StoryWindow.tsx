'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useStory } from '@/lib/storyContext';
import type { StoryBlock } from '@/lib/storyParser';
import styles from './Story.module.css';

const CHARACTER_COLORS: Record<string, string> = {
    'Sherlock Holmes': '#f59e0b',
    'Dr. Watson': '#3b82f6',
    'Inspector Lestrade': '#10b981',
    'Mrs. Hudson': '#a78bfa',
};

function NarratorBlock({ content }: { content: string }) {
    return (
        <div className={`${styles.narratorBlock} ${styles.blockFadeIn}`}>
            <p>{content}</p>
        </div>
    );
}

function DialogueBubble({ character, content }: { character: string; content: string }) {
    const color = CHARACTER_COLORS[character] || '#e2e8f0';
    return (
        <div className={`${styles.bubbleWrapper} ${styles.blockFadeIn}`}>
            <div className={styles.bubbleLeft}>
                <span className={styles.bubbleSpeaker} style={{ color }}>{character}</span>
                <span className={styles.bubbleContent}>{content}</span>
            </div>
        </div>
    );
}

function UserActionBubble({ content, characterName }: { content: string; characterName: string }) {
    const displayText = content.replace(/^I choose:\s*/i, '');
    return (
        <div className={`${styles.bubbleWrapper} ${styles.bubbleWrapperRight} ${styles.blockFadeIn}`}>
            <div className={styles.bubbleRight}>
                <span className={styles.bubbleSpeakerUser}>{characterName}</span>
                <span className={styles.bubbleContent}>{displayText}</span>
            </div>
        </div>
    );
}

function AwaitingBlock({ context }: { context: string }) {
    return (
        <div className={`${styles.awaitingBlock} ${styles.blockFadeIn}`}>
            <p>{context}</p>
        </div>
    );
}

function StoryBlockRenderer({ block, isLast, userCharacter }: { block: StoryBlock; isLast: boolean; userCharacter: string }) {
    switch (block.type) {
        case 'narrator':
            return <NarratorBlock content={block.content} />;
        case 'dialogue':
            return <DialogueBubble character={block.character} content={block.content} />;
        case 'user_action':
            return <UserActionBubble content={block.content} characterName={userCharacter} />;
        case 'decision':
            if (isLast) return null;
            return <div className={`${styles.decisionBlockPast} ${styles.blockFadeIn}`}>{block.options.join(' / ')}</div>;
        case 'awaiting_input':
            return isLast ? <AwaitingBlock context={block.context} /> : null;
        default:
            return null;
    }
}

export default function StoryWindow() {
    const { storyBlocks, isStoryLoading, userCharacter, streamingHint } = useStory();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isPinnedRef = useRef(true);
    const [showJumpBtn, setShowJumpBtn] = useState(false);
    const prevBlockCountRef = useRef(0);

    const PINNED_THRESHOLD = 100;

    const checkIfPinned = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
        isPinnedRef.current = gap < PINNED_THRESHOLD;
        setShowJumpBtn(gap >= PINNED_THRESHOLD);
    }, []);

    useEffect(() => {
        if (isPinnedRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (storyBlocks.length > prevBlockCountRef.current) {
            setShowJumpBtn(true);
        }
        prevBlockCountRef.current = storyBlocks.length;
    }, [storyBlocks]);

    const jumpToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowJumpBtn(false);
        isPinnedRef.current = true;
    }, []);

    return (
        <div className={styles.storyWindowWrap}>
            <div
                className={styles.storyWindow}
                ref={scrollContainerRef}
                onScroll={checkIfPinned}
            >
                {storyBlocks.map((block, i) => (
                    <StoryBlockRenderer
                        key={i}
                        block={block}
                        isLast={i === storyBlocks.length - 1}
                        userCharacter={userCharacter}
                    />
                ))}
                {isStoryLoading && (
                    <div className={styles.streamingIndicator}>
                        <span className={styles.streamingText}>{streamingHint || 'The story continues'}</span>
                        <span className={styles.streamingDots}>
                            <span className={styles.dot} />
                            <span className={styles.dot} />
                            <span className={styles.dot} />
                        </span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {showJumpBtn && (
                <button
                    className={styles.jumpToBottom}
                    onClick={jumpToBottom}
                    title="Jump to latest"
                >
                    ↓
                </button>
            )}
        </div>
    );
}
