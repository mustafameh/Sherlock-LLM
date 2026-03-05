'use client';

import React, { useState } from 'react';
import { STORY_SETTINGS, CHARACTER_PRESETS, VOICE_STYLES } from '@/lib/shared/story/prompts';
import styles from './page.module.css';

export default function SetupDemo3() {
    const [selectedChar, setSelectedChar] = useState(CHARACTER_PRESETS[0].id);
    const [selectedStyle, setSelectedStyle] = useState(VOICE_STYLES[0].id);
    const [selectedMystery, setSelectedMystery] = useState(STORY_SETTINGS[0].id);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div>
                        <h1 className={styles.title}>New Investigation</h1>
                        <p className={styles.subtitle}>Set up your interactive case file</p>
                    </div>
                    <button className={styles.fabBtn}>
                        Open Case File
                    </button>
                </div>
            </header>

            <div className={styles.mainGrid}>
                {/* Column 1: Character & Style */}
                <div className={styles.column}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.icon}>🎭</span>
                            <h2>The Protagonist</h2>
                        </div>
                        <div className={styles.list}>
                            {CHARACTER_PRESETS.map(c => (
                                <button
                                    key={c.id}
                                    className={`${styles.listItem} ${selectedChar === c.id ? styles.listItemActive : ''}`}
                                    onClick={() => setSelectedChar(c.id)}
                                >
                                    <strong>{c.name}</strong>
                                    <span>{c.description}</span>
                                </button>
                            ))}
                            <button
                                className={`${styles.listItem} ${selectedChar === 'custom' ? styles.listItemActive : ''}`}
                                onClick={() => setSelectedChar('custom')}
                            >
                                <strong>Custom Character</strong>
                                <span>Write your own role</span>
                            </button>
                        </div>
                    </div>

                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.icon}>✒️</span>
                            <h2>Narrative Voice</h2>
                        </div>
                        <div className={styles.tagCloud}>
                            {VOICE_STYLES.map(v => (
                                <button
                                    key={v.id}
                                    className={`${styles.tag} ${selectedStyle === v.id ? styles.tagActive : ''}`}
                                    onClick={() => setSelectedStyle(v.id)}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Mystery */}
                <div className={styles.column}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.icon}>🔍</span>
                            <h2>The Mystery</h2>
                        </div>
                        <div className={styles.gridCards}>
                            {STORY_SETTINGS.map(s => (
                                <button
                                    key={s.id}
                                    className={`${styles.gridCard} ${selectedMystery === s.id ? styles.gridCardActive : ''}`}
                                    onClick={() => setSelectedMystery(s.id)}
                                >
                                    <div className={styles.cardGlow} />
                                    <strong>{s.title}</strong>
                                    <span>{s.description}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.divider}>
                            <span>AI Generation</span>
                        </div>

                        <div className={styles.generateBox}>
                            <p>Let the AI craft a unique premise for you.</p>
                            <div className={styles.tagCloud} style={{ marginBottom: '15px' }}>
                                {['Gothic Horror', 'Heist', 'Espionage', 'Supernatural'].map(g => (
                                    <span key={g} className={styles.tagSm}>{g}</span>
                                ))}
                            </div>
                            <button
                                className={`${styles.gridCard} ${selectedMystery === 'generate' ? styles.gridCardActive : ''}`}
                                onClick={() => setSelectedMystery('generate')}
                                style={{ width: '100%', textAlign: 'center' }}
                            >
                                <strong>Select AI Generator</strong>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
