'use client';

import React, { useState } from 'react';
import { StoryProvider, useStory } from '@/lib/storyContext';
import { STORY_SETTINGS, CHARACTER_PRESETS } from '@/lib/storyPrompts';
import StoryHeader from '@/components/story/StoryHeader';
import StoryWindow from '@/components/story/StoryWindow';
import StoryInput from '@/components/story/StoryInput';
import styles from '@/components/story/Story.module.css';

function SetupScreen() {
    const { startNewStory, isStoryLoading } = useStory();
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [customCharacter, setCustomCharacter] = useState('');
    const [selectedSetting, setSelectedSetting] = useState('');

    const characterName = selectedCharacter === 'custom'
        ? customCharacter.trim()
        : CHARACTER_PRESETS.find(c => c.id === selectedCharacter)?.name || '';

    const setting = STORY_SETTINGS.find(s => s.id === selectedSetting);
    const canStart = characterName.length > 0 && setting != null;

    const handleStart = () => {
        if (!canStart || !setting) return;
        startNewStory(characterName, setting.description, setting.title);
    };

    return (
        <div className={styles.setupScreen}>
            <h1 className={styles.setupTitle}>Interactive Storytelling</h1>
            <p className={styles.setupSubtitle}>
                Step into a Sherlock Holmes mystery and shape the story with your choices.
            </p>

            <div className={styles.setupSection}>
                <span className={styles.setupLabel}>Choose Your Character</span>
                <div className={styles.characterGrid}>
                    {CHARACTER_PRESETS.map(c => (
                        <button
                            key={c.id}
                            className={`${styles.characterOption} ${selectedCharacter === c.id ? styles.characterOptionSelected : ''}`}
                            onClick={() => { setSelectedCharacter(c.id); setCustomCharacter(''); }}
                        >
                            <strong>{c.name}</strong>
                            <span>{c.description}</span>
                        </button>
                    ))}
                    <button
                        className={`${styles.characterOption} ${selectedCharacter === 'custom' ? styles.characterOptionSelected : ''}`}
                        onClick={() => setSelectedCharacter('custom')}
                    >
                        <strong>Custom Character</strong>
                        <span>Create your own role</span>
                    </button>
                </div>
                {selectedCharacter === 'custom' && (
                    <input
                        className={styles.customCharInput}
                        type="text"
                        placeholder="Enter your character's name..."
                        value={customCharacter}
                        onChange={e => setCustomCharacter(e.target.value)}
                        autoFocus
                    />
                )}
            </div>

            <div className={styles.setupSection}>
                <span className={styles.setupLabel}>Choose a Mystery</span>
                <div className={styles.settingGrid}>
                    {STORY_SETTINGS.map(s => (
                        <button
                            key={s.id}
                            className={`${styles.settingOption} ${selectedSetting === s.id ? styles.settingOptionSelected : ''}`}
                            onClick={() => setSelectedSetting(s.id)}
                        >
                            <strong>{s.title}</strong>
                            <span>{s.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                className={styles.startBtn}
                onClick={handleStart}
                disabled={!canStart || isStoryLoading}
            >
                {isStoryLoading ? 'Starting...' : 'Begin the Story'}
            </button>
        </div>
    );
}

function StoryContent() {
    const { isStoryStarted, storyError, setStoryError } = useStory();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
                </>
            ) : (
                <SetupScreen />
            )}
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
