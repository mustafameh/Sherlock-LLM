'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useSettings } from '@/lib/client/contexts';
import { AVATAR_OPTIONS } from '@/lib/shared/types';
import EditProfileModal from '@/components/shared/EditProfileModal';
import ApiKeySection from '@/components/shared/ApiKeySection';
import styles from './page.module.css';

function ApiKeyModal({ onClose }: { onClose: () => void }) {
    const { apiKeyStorage } = useSettings();

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Set Your API Key</h2>
                <p className={styles.modalDesc}>
                    Agent Sherlock uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a> to
                    access LLMs. Your key is sent only to OpenRouter for inference.
                    {apiKeyStorage === 'account'
                        ? ' It is encrypted and saved to your account so it works across devices.'
                        : ' It is stored locally in your browser.'}
                </p>
                <ApiKeySection />
                <div className={styles.modalActions}>
                    <button className={styles.btnGhost} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

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
    const { user, isLoggedIn, logout, checkAuth } = useAuth();
    const { apiKey } = useSettings();
    const [showApiModal, setShowApiModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userAvatarSrc = AVATAR_OPTIONS.find(a => a.id === user?.avatar)?.src || '/avatars/detective.svg';

    useEffect(() => { checkAuth(); }, [checkAuth]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            {/* ── GLASSMORPHISM NAVBAR ── */}
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Image src="/logo.png" alt="Agent Sherlock" width={32} height={32} style={{ objectFit: 'contain' }} />
                    <span className={styles.navBrand}>Agent Sherlock</span>
                </div>
                <div className={styles.navRight}>
                    <button className={styles.navLink} onClick={() => setShowApiModal(true)}>
                        {apiKey ? 'API Key Set' : 'Set API Key'}
                    </button>
                    {isLoggedIn ? (
                        <div className={styles.navUserWrap} ref={dropdownRef}>
                            <button className={styles.navUser} onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <Image src={userAvatarSrc} alt="Avatar" width={26} height={26} style={{ borderRadius: '50%' }} />
                                <span>{user?.displayName || user?.username}</span>
                                <span className={styles.navCaret}>{dropdownOpen ? '\u25B4' : '\u25BE'}</span>
                            </button>
                            {dropdownOpen && (
                                <div className={styles.navDropdown}>
                                    <div className={styles.navDropdownHeader}>
                                        <Image src={userAvatarSrc} alt="Avatar" width={32} height={32} style={{ borderRadius: '50%' }} />
                                        <div>
                                            <div className={styles.navDropdownName}>{user?.displayName || user?.username}</div>
                                            <div className={styles.navDropdownEmail}>{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.navDropdownItem}
                                        onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                                    >
                                        Profile Info
                                    </button>
                                    <button
                                        className={`${styles.navDropdownItem} ${styles.navDropdownLogout}`}
                                        onClick={() => { logout(); setDropdownOpen(false); }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.navLoginBtn}>Sign in</Link>
                    )}
                </div>
            </nav>

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
                        <h3>Dissertation Project</h3>
                        <p>
                            Built as part of a Master&apos;s dissertation exploring how large language models
                            can be augmented with ReAct-style reasoning and tool use to create more capable
                            conversational agents.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>Fine-Tuned LoRA Model</h3>
                        <p>
                            A custom LoRA adapter trained on the complete Sherlock Holmes canon to capture
                            Holmes&apos;s deductive style. Model weights are available for download.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>OpenRouter Integration</h3>
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

            {/* ── MODALS ── */}
            {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
            {showProfileModal && <EditProfileModal onClose={() => setShowProfileModal(false)} />}
        </>
    );
}
