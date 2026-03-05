'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useStory } from '@/lib/client/story/context';
import { useAuth, useSettings } from '@/lib/client/contexts';
import { STORY_SETTINGS, CHARACTER_PRESETS, VOICE_STYLES, GENRE_TAGS } from '@/lib/shared/story/prompts';
import type { DecisionFrequency } from '@/lib/client/contexts';
import styles from './SetupScreen.module.css';

const LOADING_PHRASES = [
    "Lighting the gas lamps...",
    "Waking Dr. Watson...",
    "Consulting the index...",
    "Gathering initial clues...",
    "Reviewing the Telegraph dispatches...",
    "Summoning the Baker Street Irregulars...",
    "Setting the scene in 1895...",
    "Packing the magnifying glass...",
    "Analyzing the premises...",
    "The game is afoot...",
];

// All characters including custom
const ALL_CHARACTERS = [
    ...CHARACTER_PRESETS,
    { id: 'custom', name: 'Custom Character', description: 'Create your own role' },
];

export default function SetupScreen() {
    const { startNewStory, isStoryLoading, savedStories, loadStory } = useStory();
    const { isLoggedIn } = useAuth();
    const { selectedModel, apiKey, temperature, decisionFrequency, setDecisionFrequency, zenMode, setZenMode } = useSettings();

    // Default directly to the first ones
    const [selectedCharacter, setSelectedCharacter] = useState<string>(CHARACTER_PRESETS[0]?.id || '');
    const [customCharacter, setCustomCharacter] = useState('');
    const [customCharacterDesc, setCustomCharacterDesc] = useState('');

    const [selectedSetting, setSelectedSetting] = useState<string>(STORY_SETTINGS[0]?.id || '');
    const [voiceStyle, setVoiceStyle] = useState<string>(VOICE_STYLES[0]?.id || '');
    const [customPremise, setCustomPremise] = useState('');

    const [genreHint, setGenreHint] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [genTitle, setGenTitle] = useState('');
    const [genDesc, setGenDesc] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genReady, setGenReady] = useState(false);

    // Mobile carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    // Loading animation phrase rotation
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isStoryLoading) { setLoadingPhraseIndex(0); return; }
        const interval = setInterval(() => {
            setLoadingPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [isStoryLoading]);

    const prevCharacter = () => setCarouselIndex(prev => (prev - 1 + ALL_CHARACTERS.length) % ALL_CHARACTERS.length);
    const nextCharacter = () => setCarouselIndex(prev => (prev + 1) % ALL_CHARACTERS.length);

    const getAvatarConfig = (id: string) => {
        if (id === 'watson') return { path: '/avatars/watson.png', align: 'center 15%' };
        if (id === 'lestrade') return { path: '/avatars/lestrade.png', align: 'center 20%' };
        if (id === 'stranger') return { path: '/avatars/stranger.png', align: 'center 15%' };
        if (id === 'irene') return { path: '/avatars/irene.png', align: 'center 10%' };
        if (id === 'hudson') return { path: '/avatars/hudson.png', align: 'center 15%' };
        return { path: '/avatars/custom.png', align: 'center 20%' };
    };

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
                        { role: 'user', content: 'Generate a mystery premise.' },
                    ],
                    promptParams: {
                        type: 'story-generate',
                        genres,
                        hint,
                    },
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
        <div className={styles.page}>
            <div className={styles.bgOverlay} />

            <div className={styles.scrollArea}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Interactive Storytelling</h1>
                        <p className={styles.subtitle}>Step into a Sherlock Holmes mystery and shape the story with your choices.</p>
                    </div>

                    {isLoggedIn && savedStories.length > 0 && (
                        <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', textAlign: 'left', position: 'relative', zIndex: 1 }}>
                            <span className={styles.sectionTitle}>Continue a Story</span>
                            <div className={styles.grid2} style={{ marginBottom: '20px' }}>
                                {savedStories.slice(0, 2).map(s => (
                                    <button
                                        key={s.id}
                                        className={styles.card}
                                        onClick={() => loadStory(s.id)}
                                    >
                                        <h3 style={{ fontSize: '0.95rem' }}>{s.title}</h3>
                                        <p style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Playing as {s.character}</p>
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative', margin: '20px 0' }}>
                                <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'transparent', padding: '0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                    or start a new story
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={styles.glassPanel}>
                        {/* Character Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Choose Your Character</h2>

                            {/* Mobile: Carousel (1 card at a time) */}
                            {isMobile ? (
                                <div className={styles.carouselWrapper}>
                                    <button className={styles.carouselBtn} onClick={prevCharacter} aria-label="Previous character">‹</button>
                                    <div className={styles.carouselCard}>
                                        <button
                                            className={`${styles.characterCard} ${selectedCharacter === ALL_CHARACTERS[carouselIndex].id ? styles.characterCardActive : ''}`}
                                            onClick={() => setSelectedCharacter(ALL_CHARACTERS[carouselIndex].id)}
                                        >
                                            <div className={styles.characterImageWrapper}>
                                                <Image src={getAvatarConfig(ALL_CHARACTERS[carouselIndex].id).path} alt={ALL_CHARACTERS[carouselIndex].name} fill style={{ objectFit: 'cover', objectPosition: getAvatarConfig(ALL_CHARACTERS[carouselIndex].id).align }} className={styles.characterImage} />
                                                <div className={styles.characterImageGradient} />
                                            </div>
                                            <div className={styles.characterInfo}>
                                                <h3 className={styles.characterName}>{ALL_CHARACTERS[carouselIndex].name}</h3>
                                                <p className={styles.characterDesc}>{ALL_CHARACTERS[carouselIndex].description}</p>
                                            </div>
                                        </button>
                                    </div>
                                    <button className={styles.carouselBtn} onClick={nextCharacter} aria-label="Next character">›</button>
                                    <div className={styles.carouselDots}>
                                        {ALL_CHARACTERS.map((c, i) => (
                                            <span key={c.id} className={`${styles.carouselDot} ${i === carouselIndex ? styles.carouselDotActive : ''}`} onClick={() => setCarouselIndex(i)} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Desktop: 3-column grid */
                                <div className={styles.characterGrid}>
                                    {ALL_CHARACTERS.map(c => (
                                        <button
                                            key={c.id}
                                            className={`${styles.characterCard} ${selectedCharacter === c.id ? styles.characterCardActive : ''}`}
                                            onClick={() => setSelectedCharacter(c.id)}
                                        >
                                            <div className={styles.characterImageWrapper}>
                                                <Image src={getAvatarConfig(c.id).path} alt={c.name} fill style={{ objectFit: 'cover', objectPosition: getAvatarConfig(c.id).align }} className={styles.characterImage} />
                                                <div className={styles.characterImageGradient} />
                                            </div>
                                            <div className={styles.characterInfo}>
                                                <h3 className={styles.characterName}>{c.name}</h3>
                                                <p className={styles.characterDesc}>{c.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedCharacter === 'custom' && (
                                <div className={styles.customInputs}>
                                    <input
                                        className={styles.textInput}
                                        type="text"
                                        placeholder="Character name..."
                                        value={customCharacter}
                                        onChange={e => setCustomCharacter(e.target.value)}
                                        autoFocus
                                    />
                                    <textarea
                                        className={styles.textInput}
                                        rows={3}
                                        placeholder="Describe your character — who are they, what do they do, what brings them to this mystery?"
                                        value={customCharacterDesc}
                                        onChange={e => setCustomCharacterDesc(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Mystery Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Choose a Mystery</h2>
                            <div className={styles.grid2}>
                                {STORY_SETTINGS.map(s => (
                                    <button
                                        key={s.id}
                                        className={`${styles.card} ${selectedSetting === s.id ? styles.cardActive : ''}`}
                                        onClick={() => setSelectedSetting(s.id)}
                                    >
                                        <h3>{s.title}</h3>
                                        <p>{s.description}</p>
                                    </button>
                                ))}
                                <button
                                    className={`${styles.card} ${selectedSetting === 'custom' ? styles.cardActive : ''}`}
                                    onClick={() => setSelectedSetting('custom')}
                                >
                                    <h3>Write Your Own</h3>
                                    <p>Describe your own mystery premise</p>
                                </button>
                                <button
                                    className={`${styles.card} ${selectedSetting === 'generate' ? styles.cardActive : ''}`}
                                    onClick={() => setSelectedSetting('generate')}
                                >
                                    <h3>Generate a Mystery</h3>
                                    <p>AI creates a unique premise for you</p>
                                </button>
                            </div>

                            {selectedSetting === 'custom' && (
                                <div className={styles.customInputs}>
                                    <textarea
                                        className={styles.textInput}
                                        rows={4}
                                        placeholder="Describe your mystery premise... e.g., 'A famous opera singer receives a death threat before her final performance at the Royal Opera House.'"
                                        value={customPremise}
                                        onChange={e => setCustomPremise(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedSetting === 'generate' && (
                                <div className={styles.customInputs}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pick genres (optional)</span>
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
                                        className={styles.textInput}
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
                                        {isGenerating ? 'Generating...' : !apiKey ? 'Set API Key First' : 'Generate Mystery Idea'}
                                    </button>
                                    {genReady && (
                                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <input
                                                className={styles.textInput}
                                                type="text"
                                                placeholder="Mystery title..."
                                                value={genTitle}
                                                onChange={e => setGenTitle(e.target.value)}
                                            />
                                            <textarea
                                                className={styles.textInput}
                                                rows={3}
                                                value={genDesc}
                                                onChange={e => setGenDesc(e.target.value)}
                                            />
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>You can edit both fields before starting.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Style & Pacing */}
                        <div className={styles.grid2}>
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Writing Style</h2>
                                <div className={styles.pillGroup}>
                                    {VOICE_STYLES.map(v => (
                                        <button
                                            key={v.id}
                                            className={`${styles.pill} ${voiceStyle === v.id ? styles.pillActive : ''}`}
                                            onClick={() => setVoiceStyle(v.id)}
                                        >
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Story Pacing</h2>
                                <div className={styles.pillGroup}>
                                    {([
                                        { value: 'frequent' as DecisionFrequency, label: 'Frequent' },
                                        { value: 'normal' as DecisionFrequency, label: 'Normal' },
                                        { value: 'sparse' as DecisionFrequency, label: 'Sparse' },
                                        { value: 'very_rare' as DecisionFrequency, label: 'Very Rare' },
                                    ]).map(o => (
                                        <button
                                            key={o.value}
                                            className={`${styles.pill} ${!zenMode && decisionFrequency === o.value ? styles.pillActive : ''}`}
                                            onClick={() => { setDecisionFrequency(o.value); if (zenMode) setZenMode(false); }}
                                            disabled={zenMode}
                                        >
                                            {o.label}
                                        </button>
                                    ))}
                                    <button
                                        className={`${styles.pill} ${zenMode ? styles.pillActive : ''}`}
                                        onClick={() => setZenMode(!zenMode)}
                                        style={zenMode ? { borderColor: 'var(--color-gold-500)', background: 'rgba(245,158,11,0.15)', color: 'var(--color-gold-300)', boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)' } : {}}
                                    >
                                        Zen Mode
                                    </button>
                                </div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                                    {zenMode
                                        ? 'Zen Mode: Story flows gracefully like a novel. Auto-continues with minimal decisions.'
                                        : `Decisions appear ${decisionFrequency === 'frequent' ? 'every 2-3' : decisionFrequency === 'normal' ? 'every 3-5' : decisionFrequency === 'sparse' ? 'every 6-8' : 'every 10-15'} exchanges.`}
                                </p>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button
                                className={styles.ctaBtn}
                                onClick={handleStart}
                                disabled={!canStart || isStoryLoading}
                            >
                                {isStoryLoading ? 'Starting...' : 'Begin the Story'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay (Option 1: Thematic Pulse) */}
            {isStoryLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <div className={styles.loadingPulse}>🔎</div>
                        <p className={styles.loadingPhrase} key={loadingPhraseIndex}>
                            {LOADING_PHRASES[loadingPhraseIndex]}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
