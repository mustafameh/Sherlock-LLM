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
        <div className={styles.page}>
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Image src="/logo.png" alt="Agent Sherlock" width={36} height={36} style={{ objectFit: 'contain' }} />
                    <span className={styles.navBrand}>Agent Sherlock</span>
                </div>
                <div className={styles.navRight}>
                    <button className={styles.navLink} onClick={() => setShowApiModal(true)}>
                        {apiKey ? '🔑 API Key Set' : '🔑 Set API Key'}
                    </button>
                    {isLoggedIn ? (
                        <div className={styles.navUserWrap} ref={dropdownRef}>
                            <button className={styles.navUser} onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <Image src={userAvatarSrc} alt="Avatar" width={28} height={28} style={{ borderRadius: '50%' }} />
                                <span>{user?.displayName || user?.username}</span>
                                <span className={styles.navCaret}>{dropdownOpen ? '▴' : '▾'}</span>
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
                                        👤 Profile Info
                                    </button>
                                    <button
                                        className={`${styles.navDropdownItem} ${styles.navDropdownLogout}`}
                                        onClick={() => { logout(); setDropdownOpen(false); }}
                                    >
                                        ↪ Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.navLoginBtn}>Login</Link>
                    )}
                </div>
            </nav>

            <section className={styles.hero}>
                <div className={styles.heroGlow} />
                <Image src="/logo.png" alt="Agent Sherlock" width={80} height={80} className={styles.heroLogo} />
                <h1 className={styles.heroTitle}>Agent Sherlock</h1>
                <p className={styles.heroTagline}>An AI detective powered by ReAct reasoning</p>
                <p className={styles.heroDesc}>
                    Step into the world of 221B Baker Street. Engage Sherlock Holmes in deductive conversation,
                    or immerse yourself in an interactive mystery where your choices shape the story.
                </p>
            </section>

            <section className={styles.modes}>
                <Link href="/story" className={styles.modeCard}>
                    <div className={styles.modeIcon}>📖</div>
                    <h2 className={styles.modeTitle}>Interactive Storytelling</h2>
                    <p className={styles.modeDesc}>
                        Step into a Sherlock Holmes mystery. A narrator sets the scene, characters speak,
                        and you influence the story through dialogue and decisions.
                    </p>
                    <span className={styles.modeAction}>Begin a Story →</span>
                </Link>

                <Link href="/roleplay" className={styles.modeCard}>
                    <div className={styles.modeIcon}>🎭</div>
                    <h2 className={styles.modeTitle}>Character Roleplay</h2>
                    <p className={styles.modeDesc}>
                        Interact with Sherlock Holmes as Dr. Watson, Mrs. Hudson, or your own character.
                        Features deep reasoning with a visible thought process, tool use, and adjustable settings.
                    </p>
                    <span className={styles.modeAction}>Enter Roleplay →</span>
                </Link>
            </section>

            <section className={styles.about}>
                <h2 className={styles.aboutTitle}>About This Project</h2>
                <div className={styles.aboutGrid}>
                    <div className={styles.aboutCard}>
                        <h3>Dissertation Project</h3>
                        <p>
                            Agent Sherlock was built as part of a Master&apos;s dissertation exploring how
                            large language models can be augmented with ReAct-style reasoning and tool use
                            to create more capable conversational agents.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>Fine-Tuned LoRA Model</h3>
                        <p>
                            A custom LoRA adapter was trained on the complete Sherlock Holmes canon to capture
                            Holmes&apos;s deductive style. The model weights are available for download, though
                            hosting is currently unavailable due to GPU resource constraints.
                        </p>
                    </div>
                    <div className={styles.aboutCard}>
                        <h3>How the API Key Works</h3>
                        <p>
                            Agent Sherlock uses OpenRouter to access various LLMs. Your API key is only sent
                            directly to OpenRouter for inference. You can keep it in your browser only, or
                            save it to your account (encrypted) so it&apos;s available on any device.
                            Many free models are available, or you can use your own credits for premium models.
                        </p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>
                    Built by Mustafa Mehmood · <a href="https://github.com/mustafamehmood/Sherlock-LLM" target="_blank" rel="noopener noreferrer">GitHub</a>
                </p>
            </footer>

            {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
            {showProfileModal && <EditProfileModal onClose={() => setShowProfileModal(false)} />}
        </div>
    );
}
