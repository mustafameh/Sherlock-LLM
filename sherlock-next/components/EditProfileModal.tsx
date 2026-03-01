'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, useSettings } from '@/lib/contexts';
import { AVATAR_OPTIONS } from '@/lib/types';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
    const { user, updateProfile } = useAuth();
    const { apiKey, clearApiKey, apiKeyStorage } = useSettings();
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'detective');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const selectedAvatarSrc = AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.src || '/avatars/detective.svg';
    const hasApiKey = !!apiKey;

    const handleSave = async () => {
        if (!displayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }
        if (displayName.trim().length > 30) {
            setError('Display name must be 30 characters or less');
            return;
        }

        setSaving(true);
        setError('');
        const success = await updateProfile(displayName.trim(), selectedAvatar);
        setSaving(false);

        if (success) {
            onClose();
        } else {
            setError('Failed to update profile. Please try again.');
        }
    };

    return (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${styles.profileModal}`}>
                <div className="modal-header">
                    <h2 className={styles.modalTitle}>Profile Info</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* Read-only Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Username</span>
                            <span className={styles.infoValue}>{user?.username || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email</span>
                            <span className={styles.infoValue}>{user?.email || '—'}</span>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="label">Display Name</label>
                        <input
                            className="input"
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Choose a display name"
                            maxLength={30}
                        />
                        <div className={styles.charCount}>{displayName.length}/30</div>
                    </div>

                    {/* Avatar Selection */}
                    <div>
                        <label className="label">Choose Avatar</label>
                        <div className={styles.avatarGrid}>
                            {AVATAR_OPTIONS.map(avatar => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    className={`${styles.avatarOption} ${selectedAvatar === avatar.id ? styles.avatarSelected : ''}`}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    title={avatar.label}
                                >
                                    <Image
                                        src={avatar.src}
                                        alt={avatar.label}
                                        width={48}
                                        height={48}
                                        className={styles.avatarImg}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className={styles.preview}>
                        <Image
                            src={selectedAvatarSrc}
                            alt="Selected avatar"
                            width={52}
                            height={52}
                            className={styles.previewAvatarImg}
                        />
                        <div className={styles.previewName}>
                            {displayName || user?.username || 'User'}
                        </div>
                    </div>

                    {/* API Key Status */}
                    <div className={styles.apiKeyStatus}>
                        <div className={styles.apiKeyStatusRow}>
                            <span className={`${styles.statusDot} ${hasApiKey ? styles.statusConnected : styles.statusNotSet}`} />
                            <span className={styles.apiKeyLabel}>
                                API Key: {hasApiKey ? 'Connected' : 'Not Set'}
                            </span>
                        </div>
                        {hasApiKey && (
                            <span className={styles.storageMode}>
                                {apiKeyStorage === 'account'
                                    ? '☁ Saved to account (encrypted)'
                                    : '🖥 Saved in browser only'}
                            </span>
                        )}
                        {hasApiKey ? (
                            <button
                                className={styles.resetKeyBtn}
                                onClick={() => clearApiKey()}
                            >
                                Reset Key
                            </button>
                        ) : (
                            <span className={styles.apiKeyHint}>
                                Set your API key in the Settings panel →
                            </span>
                        )}
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
