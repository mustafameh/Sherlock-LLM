'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useSettings } from '@/lib/contexts';
import { AVATAR_OPTIONS } from '@/lib/types';
import styles from './page.module.css';

function ApiKeyModal({ onClose }: { onClose: () => void }) {
    const { apiKey, saveApiKey, clearApiKey } = useSettings();
    const [keyInput, setKeyInput] = useState(apiKey);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        saveApiKey(keyInput);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Set Your API Key</h2>
                <p className={styles.modalDesc}>
                    Agent Sherlock uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a> to
                    access LLMs. Your key is stored locally in your browser and sent only to OpenRouter for inference.
                </p>
                <input
                    type="password"
                    className={styles.modalInput}
                    placeholder="sk-or-v1-..."
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                />
                <div className={styles.modalActions}>
                    <button className={styles.btnPrimary} onClick={handleSave}>
                        {saved ? 'Saved!' : 'Save Key'}
                    </button>
                    {apiKey && (
                        <button className={styles.btnSecondary} onClick={() => { clearApiKey(); setKeyInput(''); }}>
                            Clear Key
                        </button>
                    )}
                    <button className={styles.btnGhost} onClick={onClose}>Close</button>
                </div>
                {apiKey && <p className={styles.statusConnected}>API Key is set</p>}
            </div>
        </div>
    );
}

export default function LandingPage() {
    const { user, isLoggedIn } = useAuth();
    const { apiKey } = useSettings();
    const [showApiModal, setShowApiModal] = useState(false);
    const userAvatarSrc = AVATAR_OPTIONS.find(a => a.id === user?.avatar)?.src || '/avatars/detective.svg';

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
                        <Link href="/roleplay" className={styles.navUser}>
                            <Image src={userAvatarSrc} alt="Avatar" width={28} height={28} style={{ borderRadius: '50%' }} />
                            <span>{user?.displayName || user?.username}</span>
                        </Link>
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
                <Link href="/roleplay" className={styles.modeCard}>
                    <div className={styles.modeIcon}>🎭</div>
                    <h2 className={styles.modeTitle}>Character Roleplay</h2>
                    <p className={styles.modeDesc}>
                        Interact with Sherlock Holmes as Dr. Watson, Mrs. Hudson, or your own character.
                        Features deep reasoning with a visible thought process, tool use, and adjustable settings.
                    </p>
                    <span className={styles.modeAction}>Enter Roleplay →</span>
                </Link>

                <Link href="/story" className={styles.modeCard}>
                    <div className={styles.modeIcon}>📖</div>
                    <h2 className={styles.modeTitle}>Interactive Storytelling</h2>
                    <p className={styles.modeDesc}>
                        Step into a Sherlock Holmes mystery. A narrator sets the scene, characters speak,
                        and you influence the story through dialogue and decisions.
                    </p>
                    <span className={styles.modeAction}>Begin a Story →</span>
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
                            Agent Sherlock uses OpenRouter to access various LLMs. Your API key is stored
                            locally in your browser and is only sent directly to OpenRouter for inference.
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
        </div>
    );
}
