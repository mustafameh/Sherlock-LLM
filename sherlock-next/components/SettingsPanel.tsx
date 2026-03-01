'use client';

import React, { useState } from 'react';
import { useChat, useSettings } from '@/lib/contexts';
import { AVAILABLE_MODELS, ModelSource } from '@/lib/types';
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
        modelSource, selectedModel, apiKey, temperature, localModelStatus,
        showDebugWindow, setModelSource, saveModel, saveApiKey, clearApiKey,
        setTemperature, setShowDebugWindow,
    } = useSettings();
    const { currentCharacter, characters, setCurrentCharacter, context, setContext } = useChat();
    const [showCharModal, setShowCharModal] = useState(false);
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localModel, setLocalModel] = useState(selectedModel);
    const [collapsed, setCollapsed] = useState(false);

    const handleModelSourceChange = (source: ModelSource) => {
        setModelSource(source);
    };

    return (
        <aside className={`${styles.settings} ${collapsed ? styles.settingsCollapsed : ''}`}>
            {/* Collapsed state: just show gear icon */}
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
                    {/* Header row: title + close button inline */}
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
                                    className={`${styles.modelCard} ${modelSource === 'openrouter' ? styles.modelCardActive : ''}`}
                                    onClick={() => handleModelSourceChange('openrouter')}
                                >
                                    <div className={`${styles.modelCardRadio} ${modelSource === 'openrouter' ? styles.modelCardRadioActive : ''}`} />
                                    <div className={styles.modelCardInfo}>
                                        <h4>OpenRouter API</h4>
                                        <p>Access various AI models</p>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.modelCard} ${modelSource === 'local' ? styles.modelCardActive : ''}`}
                                    onClick={() => handleModelSourceChange('local')}
                                >
                                    <div className={`${styles.modelCardRadio} ${modelSource === 'local' ? styles.modelCardRadioActive : ''}`} />
                                    <div className={styles.modelCardInfo}>
                                        <h4>Local Fine-tuned Model</h4>
                                        <p>Use your custom model</p>
                                    </div>
                                </div>
                            </div>

                            {/* Local model status */}
                            <div className={styles.modelStatus}>
                                <div className={`${styles.statusDot} ${localModelStatus === 'ready' ? styles.statusReady :
                                    localModelStatus === 'loading' ? styles.statusLoading :
                                        localModelStatus === 'failed' ? styles.statusFailed :
                                            styles.statusNotLoaded
                                    }`} />
                                <span>Local Model: {localModelStatus === 'not_loaded' ? 'Not Loaded' : localModelStatus.charAt(0).toUpperCase() + localModelStatus.slice(1)}</span>
                            </div>

                            {/* API Key (moved here from the old Model section) */}
                            {modelSource === 'openrouter' && (
                                <div className={styles.apiKeyGroup}>
                                    <div className={styles.fieldLabel}>API Key</div>
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
                        </CollapsibleSection>

                        {/* ── MODEL ── */}
                        {modelSource === 'openrouter' && (
                            <CollapsibleSection title="Model">
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

                                {/* Temperature (moved here) */}
                                <div className={styles.fieldLabel} style={{ marginTop: '16px' }}>Temperature</div>
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
                        )}

                        {/* Local model placeholder */}
                        {modelSource === 'local' && (
                            <CollapsibleSection title="Local Model">
                                <button className={styles.btnPrimary} disabled style={{ width: '100%', opacity: 0.6 }}>
                                    🔄 Load Model (Future)
                                </button>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                                    Local model loading will be available when connected to a Python backend.
                                </p>
                            </CollapsibleSection>
                        )}

                        {/* ── CHARACTER ── */}
                        <CollapsibleSection title="Character">
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

            {/* Character Modal */}
            {showCharModal && (
                <CharacterModal onClose={() => setShowCharModal(false)} />
            )}
        </aside>
    );
}
