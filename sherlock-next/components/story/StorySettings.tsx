'use client';

import React, { useState } from 'react';
import { useSettings, type DecisionFrequency } from '@/lib/client/contexts';
import { AVAILABLE_MODELS } from '@/lib/shared/types';
import { VOICE_STYLES } from '@/lib/shared/story/prompts';
import ApiKeySection from '@/components/shared/ApiKeySection';
import styles from './StorySettings.module.css';

const CUSTOM_MODEL_OPTION = '__custom__';

const FREQUENCY_OPTIONS: { value: DecisionFrequency; label: string; hint: string }[] = [
    { value: 'frequent', label: 'Frequent', hint: 'Every 2-3 exchanges' },
    { value: 'normal', label: 'Normal', hint: 'Every 3-5 exchanges' },
    { value: 'sparse', label: 'Sparse', hint: 'Every 6-8 exchanges' },
    { value: 'very_rare', label: 'Very Rare', hint: 'Only at major crossroads' },
];

export default function StorySettings({ open, onClose }: { open: boolean; onClose: () => void }) {
    const {
        selectedModel, saveModel, temperature, setTemperature,
        decisionFrequency, setDecisionFrequency, zenMode, setZenMode,
    } = useSettings();
    const isPresetModel = AVAILABLE_MODELS.some(m => m.id === selectedModel);
    const [dropdownValue, setDropdownValue] = useState(isPresetModel ? selectedModel : CUSTOM_MODEL_OPTION);
    const [customModelId, setCustomModelId] = useState(isPresetModel ? '' : selectedModel);
    const [showApiKey, setShowApiKey] = useState(false);

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
                        value={dropdownValue}
                        onChange={e => {
                            const value = e.target.value;
                            setDropdownValue(value);
                            if (value !== CUSTOM_MODEL_OPTION) {
                                saveModel(value);
                            }
                        }}
                    >
                        {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                        <option value={CUSTOM_MODEL_OPTION}>-- Use Custom Model ID --</option>
                    </select>
                    {dropdownValue === CUSTOM_MODEL_OPTION && (
                        <div className={styles.customModelGroup}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="e.g. meta-llama/llama-3-70b-instruct"
                                value={customModelId}
                                onChange={e => setCustomModelId(e.target.value)}
                            />
                            <button
                                className={styles.saveBtn}
                                disabled={!customModelId.trim()}
                                onClick={() => { if (customModelId.trim()) saveModel(customModelId.trim()); }}
                            >
                                Confirm
                            </button>
                            <p className={styles.storageHint}>
                                Paste any model ID from openrouter.ai/models
                            </p>
                        </div>
                    )}
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
                            max="2"
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
                            <ApiKeySection compact />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
