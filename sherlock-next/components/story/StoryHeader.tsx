'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useStory } from '@/lib/client/story/context';
import { useSettings } from '@/lib/client/contexts';
import StorySettings from './StorySettings';
import styles from './Story.module.css';

export default function StoryHeader() {
    const {
        userCharacter,
        storySetting,
        isStoryStarted,
        storyBlocks,
        storyMessages,
        storyError,
        currentStoryId,
    } = useStory();
    const { selectedModel, temperature, decisionFrequency, zenMode } = useSettings();
    const [showSettings, setShowSettings] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { exportStoryAsPdf } = await import('@/lib/client/story/export');
            await exportStoryAsPdf(storyBlocks, storySetting || 'Sherlock Holmes Mystery', userCharacter);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [storyBlocks, storySetting, userCharacter, isExporting]);

    const handleDownloadDebugLog = useCallback(() => {
        const payload = {
            exportedAt: new Date().toISOString(),
            storyId: currentStoryId,
            storySetting,
            userCharacter,
            model: selectedModel,
            temperature,
            decisionFrequency,
            zenMode,
            storyError,
            counts: {
                messages: storyMessages.length,
                blocks: storyBlocks.length,
            },
            messages: storyMessages,
            blocks: storyBlocks,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(storySetting || 'story').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'story'}-debug-log.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [
        currentStoryId,
        storySetting,
        userCharacter,
        selectedModel,
        temperature,
        decisionFrequency,
        zenMode,
        storyError,
        storyMessages,
        storyBlocks,
    ]);

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
                            onClick={handleDownloadDebugLog}
                            title="Download debug log (JSON)"
                        >
                            🧾
                        </button>
                    )}
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
