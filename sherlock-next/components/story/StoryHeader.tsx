'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useStory } from '@/lib/storyContext';
import StorySettings from './StorySettings';
import styles from './Story.module.css';

export default function StoryHeader() {
    const { userCharacter, storySetting, isStoryStarted, storyBlocks } = useStory();
    const [showSettings, setShowSettings] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { exportStoryAsPdf } = await import('@/lib/storyExport');
            await exportStoryAsPdf(storyBlocks, storySetting || 'Sherlock Holmes Mystery', userCharacter);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [storyBlocks, storySetting, userCharacter, isExporting]);

    return (
        <>
            <header className={styles.storyHeader}>
                <div className={styles.storyHeaderLeft}>
                    <Link href="/" className={styles.homeLink}>← Home</Link>
                    {isStoryStarted && (
                        <div className={styles.storyMeta}>
                            <span className={styles.storySettingLabel}>{storySetting}</span>
                            <span className={styles.storyCharLabel}>Playing as {userCharacter}</span>
                        </div>
                    )}
                </div>
                <div className={styles.storyHeaderRight}>
                    {isStoryStarted && (
                        <button
                            className={styles.headerIconBtn}
                            onClick={handleExport}
                            disabled={isExporting}
                            title="Export story as PDF"
                        >
                            {isExporting ? '⏳' : '📥'}
                        </button>
                    )}
                    <button
                        className={styles.headerIconBtn}
                        onClick={() => setShowSettings(true)}
                        title="Story Settings"
                    >
                        ⚙
                    </button>
                </div>
            </header>
            <StorySettings open={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}
