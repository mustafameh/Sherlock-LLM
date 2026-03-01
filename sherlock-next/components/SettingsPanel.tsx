'use client';

import React, { useState } from 'react';
import { useChat, useSettings } from '@/lib/contexts';
import { AVAILABLE_MODELS } from '@/lib/types';
import CharacterModal from './CharacterModal';
import styles from './SettingsPanel.module.css';

function CollapsibleSection({ title, defaultOpen = true, children }: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={styles.section}>
            <button
                className={styles.sectionHeader}
                onClick={() => setOpen(!open)}
            >
                <span className={styles.sectionLabel}>{title}</span>
                <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span>
            </button>
            {open && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
}

export default function SettingsPanel() {
    const {
        selectedModel, apiKey, temperature,
        saveModel, saveApiKey, clearApiKey,
        setTemperature,
    } = useSettings();
    const { currentCharacter, characters, setCurrentCharacter, context, setContext } = useChat();
    const [showCharModal, setShowCharModal] = useState(false);
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localModel, setLocalModel] = useState(selectedModel);
    const [collapsed, setCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const [showApiKey, setShowApiKey] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <>
        {!collapsed && isMobile && (
            <div className={styles.backdrop} onClick={() => setCollapsed(true)} />
        )}
        <aside className={`${styles.settings} ${collapsed ? styles.settingsCollapsed : ''}`}>
            {collapsed && (
                <button
                    className={styles.collapseBtn}
                    onClick={() => setCollapsed(false)}
                    title="Open settings"
                >
                    ⚙
                </button>
            )}

            {!collapsed && (
                <>
                    <div className={styles.settingsHeader}>
                        <h2 className={styles.settingsTitle}>Settings</h2>
                        <button
                            className={styles.collapseBtn}
                            onClick={() => setCollapsed(true)}
                            title="Close settings"
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.settingsBody}>

                        {/* ── CONNECTION ── */}
                        <CollapsibleSection title="Connection">
                            <div className={styles.modelOptions}>
                                <div
                                    className={`${styles.modelCard} ${styles.modelCardActive}`}
                                >
                                    <div className={`${styles.modelCardRadio} ${styles.modelCardRadioActive}`} />
                                    <div className={styles.modelCardInfo}>
                                        <h4>OpenRouter API</h4>
                                        <p>Access various AI models</p>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.modelCard} ${styles.modelCardDisabled}`}
                                >
                                    <div className={styles.modelCardRadio} />
                                    <div className={styles.modelCardInfo}>
                                        <h4>Local Fine-tuned Model</h4>
                                        <p>Under Development</p>
                                    </div>
                                </div>
                            </div>

                            {/* API Key — collapsible sub-section */}
                            <div className={styles.apiKeyGroup}>
                                <button
                                    className={styles.apiKeyToggle}
                                    onClick={() => setShowApiKey(!showApiKey)}
                                >
                                    <span>Bring your own API Key</span>
                                    <span className={`${styles.chevron} ${showApiKey ? styles.chevronOpen : ''}`}>›</span>
                                </button>
                                {showApiKey && (
                                    <div className={styles.apiKeyContent}>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            placeholder="Enter your OpenRouter API key"
                                            value={localApiKey}
                                            onChange={(e) => setLocalApiKey(e.target.value)}
                                        />
                                        <div className={styles.apiKeyRow}>
                                            <button className={styles.btnPrimary} onClick={() => saveApiKey(localApiKey)}>
                                                💾 Save Key
                                            </button>
                                            <button className={styles.btnSecondary} onClick={() => { clearApiKey(); setLocalApiKey(''); }}>
                                                ✕ Clear
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* ── YOUR MODEL ── */}
                        <CollapsibleSection title="Your Model">
                            <div className={styles.fieldLabel}>Model Name</div>
                            <select
                                className={styles.select}
                                value={localModel}
                                onChange={(e) => setLocalModel(e.target.value)}
                            >
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <button
                                className={styles.btnPrimary}
                                style={{ marginTop: '8px', width: '100%' }}
                                onClick={() => saveModel(localModel)}
                            >
                                ✓ Confirm Model
                            </button>

                            <div className={styles.fieldLabel} style={{ marginTop: '16px' }}>Randomness Slider</div>
                            <div className={styles.tempRow}>
                                <input
                                    type="range"
                                    className={styles.tempSlider}
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                />
                                <span className={styles.tempValue}>{temperature.toFixed(1)}</span>
                            </div>
                        </CollapsibleSection>

                        {/* ── YOUR CHARACTER ── */}
                        <CollapsibleSection title="Your Character">
                            <select
                                className={styles.select}
                                value={currentCharacter?.name || ''}
                                onChange={(e) => {
                                    const char = characters.find(c => c.name === e.target.value);
                                    setCurrentCharacter(char || null);
                                }}
                            >
                                {characters.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <button className={styles.btnTeal} onClick={() => setShowCharModal(true)}>
                                + Custom Character
                            </button>
                        </CollapsibleSection>

                        {/* ── CONTEXT ── */}
                        <CollapsibleSection title="System Context" defaultOpen={false}>
                            <textarea
                                className={styles.contextTextarea}
                                placeholder="Enter context for the conversation..."
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                            />
                        </CollapsibleSection>

                        {/* ── DEBUG ── */}
                        <CollapsibleSection title="Debug Console" defaultOpen={false}>
                            <div className={styles.debugWindow}>
                                API requests and responses will appear here during chat interactions.
                            </div>
                        </CollapsibleSection>

                    </div>
                </>
            )}

            {showCharModal && (
                <CharacterModal onClose={() => setShowCharModal(false)} />
            )}
        </aside>
        </>
    );
}
