'use client';

import React, { useState } from 'react';
import { useSettings, useAuth } from '@/lib/client/contexts';
import styles from './ApiKeySection.module.css';

interface ApiKeySectionProps {
    compact?: boolean;
}

export default function ApiKeySection({ compact }: ApiKeySectionProps) {
    const { apiKey, saveApiKey, clearApiKey, apiKeyStorage, setApiKeyStorage } = useSettings();
    const { isLoggedIn } = useAuth();
    const [keyInput, setKeyInput] = useState(apiKey);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');

    const handleSave = () => {
        saveApiKey(keyInput);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleClear = () => {
        clearApiKey();
        setKeyInput('');
        setSaveStatus('cleared');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleSwitchToBrowser = () => {
        if (apiKeyStorage === 'account') {
            if (!window.confirm('Switching to browser-only will remove your API key from your account. Your key will only exist in this browser. Continue?')) return;
            fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: null }),
            }).catch(() => {});
        }
        setApiKeyStorage('browser');
    };

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            <input
                type="password"
                className={styles.input}
                placeholder="sk-or-v1-..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
            />
            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                    {compact ? 'Save Key' : '\uD83D\uDCBE Save Key'}
                </button>
                {apiKey && (
                    <button className={styles.clearBtn} onClick={handleClear}>
                        {compact ? 'Clear' : '\u2715 Clear'}
                    </button>
                )}
            </div>
            {saveStatus !== 'idle' && (
                <div className={styles.feedback} data-status={saveStatus}>
                    {saveStatus === 'saved' ? '\u2713 Key saved successfully' : '\u2713 Key cleared'}
                </div>
            )}
            {apiKey && saveStatus === 'idle' && (
                <span className={styles.statusMsg}>API Key is set</span>
            )}
            {isLoggedIn && (
                <div className={styles.storageToggle}>
                    <span className={styles.storageLabel}>Save key to:</span>
                    <div className={styles.storageOptions}>
                        <button
                            className={`${styles.storageBtn} ${apiKeyStorage === 'browser' ? styles.storageBtnActive : ''}`}
                            onClick={handleSwitchToBrowser}
                        >
                            {compact ? 'Browser' : '\uD83D\uDDA5 Browser only'}
                        </button>
                        <button
                            className={`${styles.storageBtn} ${apiKeyStorage === 'account' ? styles.storageBtnActive : ''}`}
                            onClick={() => setApiKeyStorage('account')}
                        >
                            {compact ? 'Account' : '\u2601 My account'}
                        </button>
                    </div>
                    <p className={styles.storageHint}>
                        {apiKeyStorage === 'browser'
                            ? 'Key stays in this browser. Re-enter on other devices.'
                            : 'Key is encrypted and saved to your account. Available on any device you log into.'}
                    </p>
                </div>
            )}
        </div>
    );
}
