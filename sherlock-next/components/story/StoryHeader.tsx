'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStory } from '@/lib/storyContext';
import StorySettings from './StorySettings';
import styles from './Story.module.css';

export default function StoryHeader() {
    const { userCharacter, storySetting, isStoryStarted } = useStory();
    const [showSettings, setShowSettings] = useState(false);

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
