'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { STORY_SETTINGS, CHARACTER_PRESETS, VOICE_STYLES } from '@/lib/shared/story/prompts';
import StorySidebar from '@/components/story/StorySidebar';
import StoryHeader from '@/components/story/StoryHeader';
import { StoryProvider } from '@/lib/client/story/context';
import styles from './page.module.css';

const MOCK_SAVED_STORIES = [
    { id: '1', title: 'The Musgrave Ritual', character: 'Dr. Watson', created_at: new Date().toISOString() },
    { id: '2', title: 'The Hound of the Baskervilles', character: 'Inspector Lestrade', created_at: new Date().toISOString() }
];

function SetupDemo1Content() {
    const [selectedChar, setSelectedChar] = useState(CHARACTER_PRESETS[0].id);
    const [selectedStyle, setSelectedStyle] = useState(VOICE_STYLES[0].id);
    const [selectedPacing, setSelectedPacing] = useState('normal');
    const [selectedMystery, setSelectedMystery] = useState(STORY_SETTINGS[0].id);

    // Map character IDs to their new avatar paths
    const getAvatarPath = (id: string) => {
        if (id === 'watson') return '/avatars/watson.png';
        if (id === 'lestrade') return '/avatars/lestrade.png';
        if (id === 'stranger') return '/avatars/stranger.png';
        return '/avatars/custom.png';
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <StorySidebar />

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <StoryHeader />

                <div className={styles.page}>
                    <div className={styles.bgOverlay} />

                    <div className={styles.container}>
                        <div className={styles.header}>
                            <h1 className={styles.title}>Interactive Storytelling</h1>
                            <p className={styles.subtitle}>Step into a Sherlock Holmes mystery and shape the story with your choices.</p>
                        </div>

                        {/* Continue Story Section - Limited to 2 */}
                        <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', textAlign: 'left' }}>
                            <span className={styles.sectionTitle}>Continue a Story</span>
                            <div className={styles.grid2} style={{ marginBottom: '20px' }}>
                                {MOCK_SAVED_STORIES.slice(0, 2).map(s => (
                                    <button key={s.id} className={styles.card}>
                                        <h3 style={{ fontSize: '0.95rem' }}>{s.title}</h3>
                                        <p style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Playing as {s.character}</p>
                                        <span style={{ fontSize: '10px', color: 'var(--color-navy-400)' }}>
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative', margin: '20px 0' }}>
                                <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-primary)', padding: '0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                    or start a new story
                                </span>
                            </div>
                        </div>

                        <div className={styles.glassPanel}>
                            {/* Character Section with Avatars */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Choose Your Character</h2>
                                <div className={styles.cardGrid2x2}>
                                    {CHARACTER_PRESETS.map(c => (
                                        <button
                                            key={c.id}
                                            className={`${styles.characterCard} ${selectedChar === c.id ? styles.characterCardActive : ''}`}
                                            onClick={() => setSelectedChar(c.id)}
                                        >
                                            <div className={styles.characterImageWrapper}>
                                                <div className={styles.characterTopIcon}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </div>
                                                <Image src={getAvatarPath(c.id)} alt={c.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} className={styles.characterImage} />
                                                <div className={styles.characterImageGradient} />
                                            </div>
                                            <div className={styles.characterInfo}>
                                                <h3 className={styles.characterName}>{c.name}</h3>
                                                <p className={styles.characterDesc}>{c.description}</p>
                                                <div className={styles.characterSelectBtn}>
                                                    Select
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    <button
                                        className={`${styles.characterCard} ${selectedChar === 'custom' ? styles.characterCardActive : ''}`}
                                        onClick={() => setSelectedChar('custom')}
                                    >
                                        <div className={styles.characterImageWrapper}>
                                            <div className={styles.characterTopIcon}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                            </div>
                                            <Image src={getAvatarPath('custom')} alt="Custom Character" fill style={{ objectFit: 'cover', objectPosition: 'top' }} className={styles.characterImage} />
                                            <div className={styles.characterImageGradient} />
                                        </div>
                                        <div className={styles.characterInfo}>
                                            <h3 className={styles.characterName}>Custom Character</h3>
                                            <p className={styles.characterDesc}>Create your own role</p>
                                            <div className={styles.characterSelectBtn}>
                                                Select
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Mystery Section */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Choose a Mystery</h2>
                                <div className={styles.grid2}>
                                    {STORY_SETTINGS.map(s => (
                                        <button
                                            key={s.id}
                                            className={`${styles.card} ${selectedMystery === s.id ? styles.cardActive : ''}`}
                                            onClick={() => setSelectedMystery(s.id)}
                                        >
                                            <h3>{s.title}</h3>
                                            <p>{s.description}</p>
                                        </button>
                                    ))}
                                    <button
                                        className={`${styles.card} ${selectedMystery === 'custom' ? styles.cardActive : ''}`}
                                        onClick={() => setSelectedMystery('custom')}
                                    >
                                        <h3>Write Your Own</h3>
                                        <p>Describe your own mystery premise</p>
                                    </button>
                                    <button
                                        className={`${styles.card} ${selectedMystery === 'generate' ? styles.cardActive : ''}`}
                                        onClick={() => setSelectedMystery('generate')}
                                    >
                                        <h3>Generate a Mystery</h3>
                                        <p>AI creates a unique premise for you</p>
                                    </button>
                                </div>
                            </div>

                            {/* Style & Pacing */}
                            <div className={styles.grid2}>
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Writing Style</h2>
                                    <div className={styles.pillGroup}>
                                        {VOICE_STYLES.map(v => (
                                            <button
                                                key={v.id}
                                                className={`${styles.pill} ${selectedStyle === v.id ? styles.pillActive : ''}`}
                                                onClick={() => setSelectedStyle(v.id)}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Story Pacing</h2>
                                    <div className={styles.pillGroup}>
                                        {['Frequent', 'Normal', 'Sparse', 'Very Rare'].map(p => (
                                            <button
                                                key={p}
                                                className={`${styles.pill} ${selectedPacing === p.toLowerCase() ? styles.pillActive : ''}`}
                                                onClick={() => setSelectedPacing(p.toLowerCase())}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <button
                                            className={`${styles.pill} styles.pillZen`}
                                            style={{ borderColor: 'var(--color-gold-500)', color: 'var(--color-gold-300)' }}
                                            onClick={() => setSelectedPacing('zen')}
                                        >
                                            Zen Mode
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                                        Decisions appear every 3-5 exchanges.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <button className={styles.ctaBtn}>Begin the Story</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SetupDemo1() {
    return (
        <StoryProvider>
            <SetupDemo1Content />
        </StoryProvider>
    );
}
