'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useStory } from '@/lib/client/story/context';
import { useSettings } from '@/lib/client/contexts';
import { deriveScenes } from '@/lib/shared/story/parser';
import type { StoryBlock } from '@/lib/shared/story/parser';
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

function ChapterDivider({ title }: { title: string }) {
    return (
        <div className={styles.chapterDivider}>
            <span className={styles.chapterLine} />
            <h2 className={styles.chapterTitle}>{title}</h2>
            <span className={styles.chapterLine} />
        </div>
    );
}

function StoryBlockRenderer({ block, isLast, userCharacter }: { block: StoryBlock; isLast: boolean; userCharacter: string }) {
    switch (block.type) {
        case 'chapter':
            return <ChapterDivider title={block.title} />;
        case 'mood':
        case 'scene_break':
            return null;
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
            return <NarratorBlock content={block.context} />;
        default:
            return null;
    }
}

export default function StoryWindow() {
    const {
        storyBlocks, isStoryLoading, userCharacter,
        streamingHint, currentSceneIndex, setCurrentSceneIndex,
        currentMood,
    } = useStory();
    const { zenMode, decisionFrequency } = useSettings();
    const isMultiScene = decisionFrequency !== 'frequent' || zenMode;

    const scrollRef = useRef<HTMLDivElement>(null);

    const scenes = useMemo(() => deriveScenes(storyBlocks), [storyBlocks]);
    const totalScenes = scenes.length;
    const isOnLatest = currentSceneIndex >= totalScenes - 1;

    useEffect(() => {
        if (isStoryLoading && !isMultiScene) {
            setCurrentSceneIndex(Math.max(0, totalScenes - 1));
        }
    }, [totalScenes, isStoryLoading, setCurrentSceneIndex, isMultiScene]);

    useEffect(() => {
        if (currentSceneIndex >= totalScenes) {
            setCurrentSceneIndex(Math.max(0, totalScenes - 1));
        }
    }, [totalScenes, currentSceneIndex, setCurrentSceneIndex]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentSceneIndex]);

    const scene = scenes[currentSceneIndex];
    const blocksToRender = scene?.blocks ?? [];

    return (
        <div className={styles.storyWindow} ref={scrollRef} data-mood={currentMood}>
            {currentSceneIndex > 0 && scenes[currentSceneIndex - 1]?.userAction && (
                <div className={styles.userActionDivider}>
                    You said: &ldquo;{scenes[currentSceneIndex - 1].userAction}&rdquo;
                </div>
            )}

            {blocksToRender.map((block, i) => (
                <StoryBlockRenderer
                    key={`${currentSceneIndex}-${i}`}
                    block={block}
                    isLast={i === blocksToRender.length - 1}
                    userCharacter={userCharacter}
                />
            ))}

            {isOnLatest && isStoryLoading && (
                <div className={styles.streamingIndicator}>
                    <span className={styles.streamingText}>
                        {isMultiScene ? 'Loading next scenes...' : (streamingHint || 'The story continues')}
                    </span>
                    <span className={styles.streamingDots}>
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                    </span>
                </div>
            )}

            {scene?.userAction && (
                <div className={styles.userActionDividerBottom}>
                    You responded: &ldquo;{scene.userAction}&rdquo;
                </div>
            )}

            {totalScenes > 1 && (
                <div className={styles.sceneNav}>
                    <button
                        className={styles.sceneNavBtn}
                        onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                        disabled={currentSceneIndex === 0}
                        title="Previous scene"
                    >
                        ‹
                    </button>
                    <span className={styles.sceneNavLabel}>
                        Scene {currentSceneIndex + 1} of {totalScenes}
                    </span>
                    <button
                        className={`${styles.sceneNavBtn} ${!isOnLatest && isMultiScene ? styles.sceneNavBtnNew : ''}`}
                        onClick={() => setCurrentSceneIndex(Math.min(totalScenes - 1, currentSceneIndex + 1))}
                        disabled={isOnLatest}
                        title="Next scene"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}
