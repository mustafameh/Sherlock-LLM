'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useStory } from '@/lib/storyContext';
import { useSettings } from '@/lib/contexts';
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
        <div className={styles.narratorBlock}>
            <p>{content}</p>
        </div>
    );
}

function DialogueBubble({ character, content }: { character: string; content: string }) {
    const color = CHARACTER_COLORS[character] || '#e2e8f0';
    return (
        <div className={styles.bubbleWrapper}>
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
        <div className={`${styles.bubbleWrapper} ${styles.bubbleWrapperRight}`}>
            <div className={styles.bubbleRight}>
                <span className={styles.bubbleSpeakerUser}>{characterName}</span>
                <span className={styles.bubbleContent}>{displayText}</span>
            </div>
        </div>
    );
}

function AwaitingBlock({ context }: { context: string }) {
    return (
        <div className={styles.awaitingBlock}>
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
            return <div className={styles.decisionBlockPast}>{block.options.join(' / ')}</div>;
        case 'awaiting_input':
            return isLast ? <AwaitingBlock context={block.context} /> : null;
        default:
            return null;
    }
}

export default function StoryWindow() {
    const {
        storyBlocks, visibleBlockCount, pendingBlockCount,
        isStoryLoading, userCharacter, streamingHint, revealNextBlock,
    } = useStory();
    const { storyScrollMode } = useSettings();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);

    const NEAR_BOTTOM_THRESHOLD = 150;

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;

        if (isNearBottomRef.current && storyScrollMode === 'block-by-block' && pendingBlockCount > 0) {
            revealNextBlock();
        }
    }, [storyScrollMode, pendingBlockCount, revealNextBlock]);

    useEffect(() => {
        if (storyScrollMode === 'all-at-once') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (storyScrollMode === 'as-ready' && isNearBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (storyScrollMode === 'block-by-block' && isNearBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [visibleBlockCount, storyScrollMode]);

    const visibleBlocks = storyBlocks.slice(0, visibleBlockCount);
    const showArrow = (storyScrollMode === 'block-by-block' && pendingBlockCount > 0)
        || (storyScrollMode === 'as-ready' && !isNearBottomRef.current && isStoryLoading);

    return (
        <div className={styles.storyWindowWrap}>
            <div
                className={styles.storyWindow}
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                {visibleBlocks.map((block, i) => (
                    <StoryBlockRenderer
                        key={i}
                        block={block}
                        isLast={i === visibleBlocks.length - 1}
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

            {showArrow && (
                <button
                    className={styles.newContentArrow}
                    onClick={() => {
                        if (storyScrollMode === 'block-by-block') {
                            revealNextBlock();
                        }
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={storyScrollMode === 'block-by-block'
                        ? `${pendingBlockCount} more block${pendingBlockCount > 1 ? 's' : ''}`
                        : 'Scroll to new content'}
                >
                    <span className={styles.arrowIcon}>↓</span>
                    {storyScrollMode === 'block-by-block' && pendingBlockCount > 0 && (
                        <span className={styles.pendingBadge}>{pendingBlockCount}</span>
                    )}
                </button>
            )}
        </div>
    );
}
