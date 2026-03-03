'use client';

import React, { useState, useCallback } from 'react';
import { StoryProvider, useStory } from '@/lib/storyContext';
import { useAuth, useSettings } from '@/lib/contexts';
import { STORY_SETTINGS, CHARACTER_PRESETS, VOICE_STYLES, GENRE_TAGS } from '@/lib/storyPrompts';
import type { DecisionFrequency } from '@/lib/contexts';
import StoryHeader from '@/components/story/StoryHeader';
import StoryWindow from '@/components/story/StoryWindow';
import StoryInput from '@/components/story/StoryInput';
import StorySidebar from '@/components/story/StorySidebar';
import styles from '@/components/story/Story.module.css';

function SetupScreen() {
    const { startNewStory, isStoryLoading, savedStories, loadStory } = useStory();
    const { isLoggedIn } = useAuth();
    const { selectedModel, apiKey, temperature, decisionFrequency, setDecisionFrequency, zenMode, setZenMode } = useSettings();
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [customCharacter, setCustomCharacter] = useState('');
    const [customCharacterDesc, setCustomCharacterDesc] = useState('');
    const [selectedSetting, setSelectedSetting] = useState('');
    const [voiceStyle, setVoiceStyle] = useState('classic');
    const [customPremise, setCustomPremise] = useState('');
    const [genreHint, setGenreHint] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [genTitle, setGenTitle] = useState('');
    const [genDesc, setGenDesc] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genReady, setGenReady] = useState(false);

    const selectedPreset = CHARACTER_PRESETS.find(c => c.id === selectedCharacter);
    const characterName = selectedCharacter === 'custom'
        ? customCharacter.trim()
        : selectedPreset?.name || '';
    const characterDescription = selectedCharacter === 'custom'
        ? customCharacterDesc.trim()
        : selectedPreset?.description || '';

    const getSettingData = () => {
        if (selectedSetting === 'custom') {
            return { description: customPremise.trim(), title: 'Custom Mystery' };
        }
        if (selectedSetting === 'generate') {
            return genReady ? { description: genDesc.trim(), title: genTitle.trim() } : null;
        }
        const setting = STORY_SETTINGS.find(s => s.id === selectedSetting);
        return setting ? { description: setting.description, title: setting.title } : null;
    };

    const settingData = getSettingData();
    const canStart = characterName.length > 0 && settingData != null
        && settingData.description.length > 0;

    const handleStart = () => {
        if (!canStart || !settingData) return;
        startNewStory(characterName, settingData.description, settingData.title, characterDescription || undefined, voiceStyle);
    };

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleGenerate = useCallback(async () => {
        if (!apiKey) return;
        setIsGenerating(true);
        setGenReady(false);
        try {
            const genres = selectedGenres.length > 0 ? selectedGenres.join(', ') : 'any genre';
            const hint = genreHint.trim() || 'surprise me';
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    temperature: Math.min(temperature, 0.7),
                    apiKey,
                    messages: [
                        {
                            role: 'user',
                            content: `Generate a Sherlock Holmes mystery premise. Genre: ${genres}. Additional idea: ${hint}.\nReturn ONLY a valid JSON object with two fields: "title" (short, dramatic title) and "description" (2-3 sentences setting the scene). No markdown, no code fences, just raw JSON.`,
                        },
                    ],
                }),
            });
            if (!res.ok) throw new Error('Generation failed');
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content?.trim() || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setGenTitle(parsed.title || 'Generated Mystery');
                setGenDesc(parsed.description || '');
                setGenReady(true);
            } else {
                setGenTitle('Generated Mystery');
                setGenDesc(text);
                setGenReady(true);
            }
        } catch {
            setGenTitle('');
            setGenDesc('Failed to generate. Try again or write your own.');
        } finally {
            setIsGenerating(false);
        }
    }, [apiKey, selectedModel, temperature, selectedGenres, genreHint]);

    return (
        <div className={styles.setupScreen}>
            <h1 className={styles.setupTitle}>Interactive Storytelling</h1>
            <p className={styles.setupSubtitle}>
                Step into a Sherlock Holmes mystery and shape the story with your choices.
            </p>

            {isLoggedIn && savedStories.length > 0 && (
                <div className={styles.continueSection}>
                    <span className={styles.setupLabel}>Continue a Story</span>
                    <div className={styles.continueGrid}>
                        {savedStories.slice(0, 5).map(s => (
                            <button
                                key={s.id}
                                className={styles.storyCard}
                                onClick={() => loadStory(s.id)}
                            >
                                <strong>{s.title}</strong>
                                <span>Playing as {s.character}</span>
                                <span className={styles.storyCardDate}>
                                    {new Date(s.created_at).toLocaleDateString()}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className={styles.continueDivider}>
                        <span>or start a new story</span>
                    </div>
                </div>
            )}

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
                    <div className={styles.customCharFields}>
                        <input
                            className={styles.customCharInput}
                            type="text"
                            placeholder="Character name..."
                            value={customCharacter}
                            onChange={e => setCustomCharacter(e.target.value)}
                            autoFocus
                        />
                        <textarea
                            className={styles.customCharInput}
                            rows={3}
                            placeholder="Describe your character — who are they, what do they do, what brings them to this mystery?"
                            value={customCharacterDesc}
                            onChange={e => setCustomCharacterDesc(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className={styles.setupSection}>
                <span className={styles.setupLabel}>Writing Style</span>
                <div className={styles.voiceStyleGrid}>
                    {VOICE_STYLES.map(v => (
                        <button
                            key={v.id}
                            className={`${styles.voiceStyleBtn} ${voiceStyle === v.id ? styles.voiceStyleBtnActive : ''}`}
                            onClick={() => setVoiceStyle(v.id)}
                        >
                            {v.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.setupSection}>
                <span className={styles.setupLabel}>Story Pacing</span>
                <div className={styles.voiceStyleGrid}>
                    {([
                        { value: 'frequent' as DecisionFrequency, label: 'Frequent', hint: 'Choices every 2-3 turns' },
                        { value: 'normal' as DecisionFrequency, label: 'Normal', hint: 'Choices every 3-5 turns' },
                        { value: 'sparse' as DecisionFrequency, label: 'Sparse', hint: 'Choices every 6-8 turns' },
                        { value: 'very_rare' as DecisionFrequency, label: 'Very Rare', hint: 'Only at key crossroads' },
                    ]).map(o => (
                        <button
                            key={o.value}
                            className={`${styles.voiceStyleBtn} ${!zenMode && decisionFrequency === o.value ? styles.voiceStyleBtnActive : ''}`}
                            onClick={() => { setDecisionFrequency(o.value); if (zenMode) setZenMode(false); }}
                            title={o.hint}
                            disabled={zenMode}
                        >
                            {o.label}
                        </button>
                    ))}
                    <button
                        className={`${styles.voiceStyleBtn} ${zenMode ? styles.voiceStyleBtnActive : ''}`}
                        onClick={() => setZenMode(!zenMode)}
                        title="Story auto-continues like a novel. Minimal decisions."
                        style={zenMode ? { borderColor: 'var(--color-gold-500)', background: 'rgba(245,158,11,0.15)', color: 'var(--color-gold-300)' } : {}}
                    >
                        Zen Mode
                    </button>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {zenMode
                        ? 'Zen Mode: Story flows like a novel. Auto-continues with minimal decisions.'
                        : `Decisions appear ${decisionFrequency === 'frequent' ? 'every 2-3' : decisionFrequency === 'normal' ? 'every 3-5' : decisionFrequency === 'sparse' ? 'every 6-8' : 'every 10-15'} exchanges.`}
                </p>
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
                    <button
                        className={`${styles.settingOption} ${selectedSetting === 'custom' ? styles.settingOptionSelected : ''}`}
                        onClick={() => setSelectedSetting('custom')}
                    >
                        <strong>Write Your Own</strong>
                        <span>Describe your own mystery premise</span>
                    </button>
                    <button
                        className={`${styles.settingOption} ${selectedSetting === 'generate' ? styles.settingOptionSelected : ''}`}
                        onClick={() => setSelectedSetting('generate')}
                    >
                        <strong>Generate a Mystery</strong>
                        <span>AI creates a unique premise for you</span>
                    </button>
                </div>

                {selectedSetting === 'custom' && (
                    <div className={styles.customPremiseArea}>
                        <textarea
                            className={styles.customCharInput}
                            rows={4}
                            placeholder="Describe your mystery premise... e.g., 'A famous opera singer receives a death threat before her final performance at the Royal Opera House.'"
                            value={customPremise}
                            onChange={e => setCustomPremise(e.target.value)}
                        />
                    </div>
                )}

                {selectedSetting === 'generate' && (
                    <div className={styles.generateArea}>
                        <span className={styles.genSubLabel}>Pick genres (optional)</span>
                        <div className={styles.genreTagGrid}>
                            {GENRE_TAGS.map(g => (
                                <button
                                    key={g}
                                    className={`${styles.genreTag} ${selectedGenres.includes(g) ? styles.genreTagActive : ''}`}
                                    onClick={() => toggleGenre(g)}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                        <textarea
                            className={styles.customCharInput}
                            rows={2}
                            placeholder="Add a vibe or idea (e.g., 'something spooky on a train')..."
                            value={genreHint}
                            onChange={e => setGenreHint(e.target.value)}
                        />
                        <button
                            className={styles.generateBtn}
                            onClick={handleGenerate}
                            disabled={isGenerating || !apiKey}
                        >
                            {isGenerating ? 'Generating...' : !apiKey ? 'Set API Key First' : 'Generate'}
                        </button>
                        {genReady && (
                            <div className={styles.genResult}>
                                <input
                                    className={styles.customCharInput}
                                    type="text"
                                    placeholder="Mystery title..."
                                    value={genTitle}
                                    onChange={e => setGenTitle(e.target.value)}
                                />
                                <textarea
                                    className={styles.customCharInput}
                                    rows={3}
                                    value={genDesc}
                                    onChange={e => setGenDesc(e.target.value)}
                                />
                                <span className={styles.genHint}>You can edit both fields before starting.</span>
                            </div>
                        )}
                    </div>
                )}
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
