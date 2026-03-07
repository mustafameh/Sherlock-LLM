'use client';

import React from 'react';
import { StoryProvider, useStory } from '@/lib/client/story/context';
import StoryHeader from '@/components/story/StoryHeader';
import StoryWindow from '@/components/story/StoryWindow';
import StoryInput from '@/components/story/StoryInput';
import StorySidebar from '@/components/story/StorySidebar';
import SetupScreen from '@/components/story/SetupScreen';
import StorySummaryPanel from '@/components/story/StorySummaryPanel';
import styles from '@/components/story/Story.module.css';

function StoryContent() {
    const { isStoryStarted, storyError, setStoryError, storyBlocks } = useStory();

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <StorySidebar />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <StoryHeader />
                {storyError && (
                    <div className={styles.errorBanner}>
                        <span>{storyError}</span>
                        <button onClick={() => setStoryError(null)}>✕</button>
                    </div>
                )}
                {isStoryStarted ? (
                    <>
                        <StoryWindow />
                        <StoryInput />
                        <StorySummaryPanel blocks={storyBlocks} />
                    </>
                ) : (
                    <SetupScreen />
                )}
            </div>
        </div>
    );
}

export default function StoryPage() {
    return (
        <StoryProvider>
            <StoryContent />
        </StoryProvider>
    );
}
