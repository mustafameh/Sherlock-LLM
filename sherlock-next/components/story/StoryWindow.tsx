'use client';

import React, { useEffect, useRef } from 'react';
import { useStory } from '@/lib/storyContext';
import type { StoryBlock } from '@/lib/storyParser';
import styles from './Story.module.css';

function NarratorBlock({ content }: { content: string }) {
    return (
        <div className={styles.narratorBlock}>
            <p>{content}</p>
        </div>
    );
}

const CHARACTER_COLORS: Record<string, string> = {
    'Sherlock Holmes': '#f59e0b',
    'Dr. Watson': '#3b82f6',
    'Inspector Lestrade': '#10b981',
    'Mrs. Hudson': '#a78bfa',
};

function DialogueBlock({ character, content }: { character: string; content: string }) {
    const color = CHARACTER_COLORS[character] || '#e2e8f0';
    return (
        <div className={styles.dialogueBlock}>
            <span className={styles.dialogueCharacter} style={{ color }}>{character}</span>
            <p className={styles.dialogueContent}>{content}</p>
        </div>
    );
}

function DecisionBlock({ options, onSelect }: { options: string[]; onSelect: (opt: string) => void }) {
    return (
        <div className={styles.decisionBlock}>
            <span className={styles.decisionLabel}>What will you do?</span>
            <div className={styles.decisionOptions}>
                {options.map((opt, i) => (
                    <button key={i} className={styles.decisionBtn} onClick={() => onSelect(opt)}>
                        {opt}
                    </button>
                ))}
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

function StoryBlockRenderer({ block, isLast }: { block: StoryBlock; isLast: boolean }) {
    const { selectDecision, isStoryLoading } = useStory();

    switch (block.type) {
        case 'narrator':
            return <NarratorBlock content={block.content} />;
        case 'dialogue':
            return <DialogueBlock character={block.character} content={block.content} />;
        case 'decision':
            return isLast && !isStoryLoading
                ? <DecisionBlock options={block.options} onSelect={selectDecision} />
                : <div className={styles.decisionBlockPast}>{block.options.join(' / ')}</div>;
        case 'awaiting_input':
            return isLast ? <AwaitingBlock context={block.context} /> : null;
        default:
            return null;
    }
}

export default function StoryWindow() {
    const { storyBlocks, isStoryLoading } = useStory();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [storyBlocks, isStoryLoading]);

    return (
        <div className={styles.storyWindow}>
            {storyBlocks.map((block, i) => (
                <StoryBlockRenderer
                    key={i}
                    block={block}
                    isLast={i === storyBlocks.length - 1}
                />
            ))}
            {isStoryLoading && (
                <div className={styles.loadingIndicator}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}
