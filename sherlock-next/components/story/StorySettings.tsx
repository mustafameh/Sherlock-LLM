'use client';

import React, { useState } from 'react';
import { useSettings, useAuth, type DecisionFrequency } from '@/lib/contexts';
import { AVAILABLE_MODELS } from '@/lib/types';
import { VOICE_STYLES } from '@/lib/storyPrompts';
import styles from './StorySettings.module.css';

const FREQUENCY_OPTIONS: { value: DecisionFrequency; label: string; hint: string }[] = [
    { value: 'frequent', label: 'Frequent', hint: 'Every 2-3 exchanges' },
    { value: 'normal', label: 'Normal', hint: 'Every 3-5 exchanges' },
    { value: 'sparse', label: 'Sparse', hint: 'Every 6-8 exchanges' },
    { value: 'very_rare', label: 'Very Rare', hint: 'Only at major crossroads' },
];

export default function StorySettings({ open, onClose }: { open: boolean; onClose: () => void }) {
    const {
        selectedModel, saveModel, apiKey, saveApiKey, clearApiKey, temperature, setTemperature,
        apiKeyStorage, setApiKeyStorage, decisionFrequency, setDecisionFrequency,
        zenMode, setZenMode,
    } = useSettings();
    const { isLoggedIn } = useAuth();
    const [keyInput, setKeyInput] = useState(apiKey);
    const [showApiKey, setShowApiKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');

    const handleSaveKey = () => {
        saveApiKey(keyInput);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleClearKey = () => {
        clearApiKey();
        setKeyInput('');
        setSaveStatus('cleared');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={e => e.stopPropagation()}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Story Settings</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Your Model</label>
                    <select
                        className={styles.select}
                        value={selectedModel}
                        onChange={e => saveModel(e.target.value)}
                    >
                        {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Writing Style</label>
                    <select
                        className={styles.select}
                        defaultValue="classic"
                    >
                        {VOICE_STYLES.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <p className={styles.storageHint}>Applies to new stories only.</p>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Decision Frequency</label>
                    <select
                        className={styles.select}
                        value={decisionFrequency}
                        onChange={e => setDecisionFrequency(e.target.value as DecisionFrequency)}
                        disabled={zenMode}
                    >
                        {FREQUENCY_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label} — {o.hint}</option>
                        ))}
                    </select>
                    {zenMode && <p className={styles.storageHint}>Overridden by Zen Mode.</p>}
                    <p className={styles.storageHint}>Applies to new stories only.</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.zenRow}>
                        <label className={styles.label} style={{ marginBottom: 0 }}>Zen Mode</label>
                        <button
                            className={`${styles.zenToggle} ${zenMode ? styles.zenToggleOn : ''}`}
                            onClick={() => setZenMode(!zenMode)}
                            role="switch"
                            aria-checked={zenMode}
                        >
                            <span className={styles.zenKnob} />
                        </button>
                    </div>
                    <p className={styles.storageHint}>
                        Story flows continuously like a novel. Decisions are rare. Auto-continues after each response.
                    </p>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Randomness Slider</label>
                    <div className={styles.sliderRow}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={e => setTemperature(parseFloat(e.target.value))}
                            className={styles.slider}
                        />
                        <span className={styles.sliderValue}>{temperature}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <button
                        className={styles.toggleLabel}
                        onClick={() => setShowApiKey(!showApiKey)}
                    >
                        <span>API Key</span>
                        <span className={styles.toggleCaret}>{showApiKey ? '▾' : '▸'}</span>
                    </button>
                    {showApiKey && (
                        <div className={styles.apiKeyContent}>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="sk-or-v1-..."
                                value={keyInput}
                                onChange={e => setKeyInput(e.target.value)}
                            />
                            <div className={styles.apiKeyActions}>
                                <button className={styles.saveBtn} onClick={handleSaveKey}>Save Key</button>
                                {apiKey && (
                                    <button className={styles.clearBtn} onClick={handleClearKey}>Clear</button>
                                )}
                            </div>
                            {saveStatus === 'saved' && <span className={styles.savedMsg}>Key saved</span>}
                            {saveStatus === 'cleared' && <span className={styles.clearedMsg}>Key cleared</span>}
                            {apiKey && saveStatus === 'idle' && (
                                <span className={styles.statusMsg}>API Key is set</span>
                            )}
                            {isLoggedIn && (
                                <div className={styles.storageToggle}>
                                    <span className={styles.storageLabel}>Save key to:</span>
                                    <div className={styles.storageOptions}>
                                        <button
                                            className={`${styles.storageBtn} ${apiKeyStorage === 'browser' ? styles.storageBtnActive : ''}`}
                                            onClick={() => {
                                                if (apiKeyStorage === 'account') {
                                                    if (!window.confirm('Switching to browser-only will remove your API key from your account. Continue?')) return;
                                                    fetch('/api/user/profile', {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ apiKey: null }),
                                                    }).catch(() => {});
                                                }
                                                setApiKeyStorage('browser');
                                            }}
                                        >
                                            🖥 Browser
                                        </button>
                                        <button
                                            className={`${styles.storageBtn} ${apiKeyStorage === 'account' ? styles.storageBtnActive : ''}`}
                                            onClick={() => setApiKeyStorage('account')}
                                        >
                                            ☁ Account
                                        </button>
                                    </div>
                                    <p className={styles.storageHint}>
                                        {apiKeyStorage === 'browser'
                                            ? 'Key stays in this browser only.'
                                            : 'Key encrypted & saved to your account.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
