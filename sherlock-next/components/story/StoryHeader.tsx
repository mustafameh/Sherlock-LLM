'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStory } from '@/lib/storyContext';
import { useAuth } from '@/lib/contexts';
import StorySettings from './StorySettings';
import styles from './Story.module.css';

export default function StoryHeader() {
    const { userCharacter, storySetting, resetStory, isStoryStarted, savedStories, loadStory } = useStory();
    const { isLoggedIn } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const savedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (savedRef.current && !savedRef.current.contains(e.target as Node)) {
                setShowSaved(false);
            }
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

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
                    {isLoggedIn && savedStories.length > 0 && (
                        <div className={styles.savedDropdownWrap} ref={savedRef}>
                            <button
                                className={styles.headerIconBtn}
                                onClick={() => setShowSaved(!showSaved)}
                                title="Saved Stories"
                            >
                                📚
                            </button>
                            {showSaved && (
                                <div className={styles.savedDropdown}>
                                    <span className={styles.savedDropdownTitle}>Saved Stories</span>
                                    {savedStories.map(s => (
                                        <button
                                            key={s.id}
                                            className={styles.savedItem}
                                            onClick={() => { loadStory(s.id); setShowSaved(false); }}
                                        >
                                            <strong>{s.title}</strong>
                                            <span>{s.character}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        className={styles.headerIconBtn}
                        onClick={() => setShowSettings(true)}
                        title="Story Settings"
                    >
                        ⚙
                    </button>
                    {isStoryStarted && (
                        <button className={styles.resetBtn} onClick={resetStory}>
                            New Story
                        </button>
                    )}
                </div>
            </header>
            <StorySettings open={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}
