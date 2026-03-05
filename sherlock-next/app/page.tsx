'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/client/contexts';
import Header from '@/components/shared/Header';
import styles from './page.module.css';



const STORY_FEATURES = [
    { icon: '\u25A3', text: 'Scene-by-scene navigation' },
    { icon: '\u2728', text: 'AI mood and atmosphere theming' },
    { icon: '\u2756', text: 'Chapter progression with titles' },
    { icon: '\u2193', text: 'Export your story as PDF' },
];

const ROLEPLAY_FEATURES = [
    { icon: '\u25C9', text: 'ReAct reasoning chain' },
    { icon: '\u2736', text: 'Deep deductive analysis' },
    { icon: '\u2699', text: 'Tool use and observations' },
    { icon: '\u270E', text: 'Custom character creation' },
];

export default function LandingPage() {
    const { checkAuth } = useAuth();

    useEffect(() => { checkAuth(); }, [checkAuth]);

    return (
        <>
            {/* ── GHOST GLOW HEADER ── */}
            <Header />

            {/* ── SPLIT SCREEN ── */}
            <section className={styles.splitScreen}>
                <div className={`${styles.splitHalf} ${styles.splitLeft}`}>
                    <div className={styles.splitContent}>
                        <h1 className={styles.splitTitle}>Interactive Storytelling</h1>
                        <p className={styles.splitDesc}>
                            Step into a Sherlock Holmes mystery. The narrator sets the scene, characters speak,
                            and your choices shape the story.
                        </p>
                        <ul className={styles.featureList}>
                            {STORY_FEATURES.map(f => (
                                <li key={f.text} className={styles.featureItem}>
                                    <span className={`${styles.featureIcon} ${styles.featureIconAmber}`}>{f.icon}</span>
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                        <Link href="/story" className={`${styles.ctaBtn} ${styles.ctaBtnAmber}`}>
                            Begin a Story
                        </Link>
                    </div>
                </div>

                <div className={`${styles.splitHalf} ${styles.splitRight}`}>
                    <div className={styles.splitContent}>
                        <h1 className={styles.splitTitle}>Character Roleplay</h1>
                        <p className={styles.splitDesc}>
                            Converse with Sherlock Holmes as Watson, Mrs. Hudson, or create your own character.
                            Watch his deductive reasoning unfold step by step.
                        </p>
                        <ul className={styles.featureList}>
                            {ROLEPLAY_FEATURES.map(f => (
                                <li key={f.text} className={styles.featureItem}>
                                    <span className={`${styles.featureIcon} ${styles.featureIconBlue}`}>{f.icon}</span>
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                        <Link href="/roleplay" className={`${styles.ctaBtn} ${styles.ctaBtnBlue}`}>
                            Enter Roleplay
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── ABOUT SECTION ── */}
            <section className={styles.about}>
                <h2 className={styles.aboutTitle}>About This Project</h2>
                <div className={styles.aboutGrid}>
                    <div className={styles.aboutCard}>
                        <h3>📖 Master&apos;s Dissertation</h3>
                        <p>
                            Built as part of a Master&apos;s dissertation exploring how large language models
                            can be augmented with ReAct-style reasoning and tool use to create more capable
                            conversational agents.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>🧬 Fine-Tuned LoRA</h3>
                        <p>
                            A custom LoRA adapter trained on the complete Sherlock Holmes canon to capture
                            Holmes&apos;s deductive style. Model weights are available for download.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>🔗 OpenRouter Integration</h3>
                        <p>
                            Access 10+ AI models via OpenRouter. Your API key is sent only to OpenRouter
                            for inference. Free models available, or use your own credits for premium models.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className={styles.footer}>
                <p>
                    Built by Mustafa Mehmood &middot; <a href="https://github.com/mustafameh/Sherlock-LLM" target="_blank" rel="noopener noreferrer">GitHub</a>
                </p>
            </footer>


        </>
    );
}
