'use client';

import React, { useEffect, useRef } from 'react';
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
    const { storyBlocks, isStoryLoading, userCharacter, streamingHint } = useStory();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [storyBlocks, isStoryLoading, streamingHint]);

    return (
        <div className={styles.storyWindow}>
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
    );
}
