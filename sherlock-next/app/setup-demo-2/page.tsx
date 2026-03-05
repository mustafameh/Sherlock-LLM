'use client';

import React, { useState } from 'react';
import { STORY_SETTINGS, CHARACTER_PRESETS, VOICE_STYLES } from '@/lib/shared/story/prompts';
import styles from './page.module.css';

export default function SetupDemo2() {
    const [selectedChar, setSelectedChar] = useState(CHARACTER_PRESETS[0].id);
    const [selectedStyle, setSelectedStyle] = useState(VOICE_STYLES[0].id);
    const [selectedPacing, setSelectedPacing] = useState('normal');
    const [selectedMystery, setSelectedMystery] = useState(STORY_SETTINGS[0].id);

    return (
        <div className={styles.splitScreen}>
            <div className={styles.leftHalf}>
                <div className={styles.leftContent}>
                    <h1 className={styles.heroTitle}>A New Case Awaits</h1>
                    <p className={styles.heroDesc}>
                        The game is afoot. Configure the parameters of your investigation and step into the boots of Sherlock Holmes's companions.
                    </p>
                </div>
            </div>

            <div className={styles.rightHalf}>
                <div className={styles.formContainer}>
                    <h2 className={styles.formTitle}>Story Configuration</h2>

                    <div className={styles.section}>
                        <div className={styles.labelGroup}>
                            <span className={styles.stepNum}>01</span>
                            <span className={styles.labelText}>The Protagonist</span>
                        </div>
                        <div className={styles.cardList}>
                            {CHARACTER_PRESETS.map(c => (
                                <div
                                    key={c.id}
                                    className={`${styles.rowCard} ${selectedChar === c.id ? styles.rowCardActive : ''}`}
                                    onClick={() => setSelectedChar(c.id)}
                                >
                                    <div className={styles.cardRadio}>
                                        <div className={styles.radioInner} />
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3>{c.name}</h3>
                                        <p>{c.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.labelGroup}>
                            <span className={styles.stepNum}>02</span>
                            <span className={styles.labelText}>The Mystery</span>
                        </div>
                        <div className={styles.cardList}>
                            {STORY_SETTINGS.map(s => (
                                <div
                                    key={s.id}
                                    className={`${styles.rowCard} ${selectedMystery === s.id ? styles.rowCardActive : ''}`}
                                    onClick={() => setSelectedMystery(s.id)}
                                >
                                    <div className={styles.cardRadio}>
                                        <div className={styles.radioInner} />
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3>{s.title}</h3>
                                        <p>{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.labelGroup}>
                            <span className={styles.stepNum}>03</span>
                            <span className={styles.labelText}>Atmosphere & Pacing</span>
                        </div>

                        <div className={styles.selectGrid}>
                            <div className={styles.selectBox}>
                                <label>Writing Style</label>
                                <select
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    className={styles.dropdown}
                                >
                                    {VOICE_STYLES.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.selectBox}>
                                <label>Decision Frequency</label>
                                <select
                                    value={selectedPacing}
                                    onChange={(e) => setSelectedPacing(e.target.value)}
                                    className={styles.dropdown}
                                >
                                    <option value="frequent">Frequent (2-3 exchanges)</option>
                                    <option value="normal">Normal (3-5 exchanges)</option>
                                    <option value="sparse">Sparse (6-8 exchanges)</option>
                                    <option value="zen">Zen Mode (Auto-read)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button className={styles.submitBtn}>
                        Commence Investigation
                    </button>
                    <div style={{ height: '40px' }}></div>
                </div>
            </div>
        </div>
    );
}
