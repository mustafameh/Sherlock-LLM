'use client';

import React from 'react';
import { StoryProvider, useStory } from '@/lib/client/story/context';
import { useState } from 'react';
import StoryHeader from '@/components/story/StoryHeader';
import StoryWindow from '@/components/story/StoryWindow';
import StoryInput from '@/components/story/StoryInput';
import StorySidebar from '@/components/story/StorySidebar';
import SetupScreen from '@/components/story/SetupScreen';
import StorySummaryPanel from '@/components/story/StorySummaryPanel';
import styles from '@/components/story/Story.module.css';
import summaryStyles from '@/components/story/StorySummary.module.css';
import { BookOpen } from 'lucide-react';

function StoryContent() {
    const { isStoryStarted, storyError, setStoryError, storyBlocks } = useStory();
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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
                        <button
                            className={summaryStyles.summaryFab}
                            onClick={() => setIsSummaryOpen(true)}
                            title="Story Thus Far"
                            aria-label="Open story summary"
                        >
                            <BookOpen size={24} />
                        </button>
                        <StorySummaryPanel
                            blocks={storyBlocks}
                            isOpen={isSummaryOpen}
                            onClose={() => setIsSummaryOpen(false)}
                        />
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
