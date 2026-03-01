'use client';

import React from 'react';
import Link from 'next/link';
import { useStory } from '@/lib/storyContext';
import styles from './Story.module.css';

export default function StoryHeader() {
    const { userCharacter, storySetting, resetStory, isStoryStarted } = useStory();

    return (
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
            {isStoryStarted && (
                <button className={styles.resetBtn} onClick={resetStory}>
                    New Story
                </button>
            )}
        </header>
    );
}
