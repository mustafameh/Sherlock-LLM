'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, useSettings } from '@/lib/client/contexts';
import { AVATAR_OPTIONS } from '@/lib/shared/types';
import { Key, Eye, EyeOff, Shield, Monitor, Cloud, User, Mail } from 'lucide-react';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
    const { user, updateProfile } = useAuth();
    const { apiKey, saveApiKey, clearApiKey, apiKeyStorage, setApiKeyStorage } = useSettings();
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'detective');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // API Key local state
    const [newApiKey, setNewApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [storageMode, setStorageMode] = useState<'browser' | 'account'>(apiKeyStorage || 'browser');

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

    const handleSetApiKey = () => {
        if (!newApiKey.trim()) return;
        setApiKeyStorage(storageMode);
        saveApiKey(newApiKey.trim());
        setNewApiKey('');
    };

    return (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.profileModal}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Profile & Settings</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalBody}>
                    {/* ── Profile Preview ── */}
                    <div className={styles.profilePreview}>
                        <Image
                            src={selectedAvatarSrc}
                            alt="Selected avatar"
                            width={64}
                            height={64}
                            className={styles.previewAvatar}
                        />
                        <div className={styles.previewInfo}>
                            <div className={styles.previewName}>
                                {displayName || user?.username || 'User'}
                            </div>
                            <div className={styles.previewEmail}>{user?.email}</div>
                        </div>
                    </div>

                    {/* ── Account Info ── */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Account</div>
                        <div className={styles.infoCard}>
                            <div className={styles.infoRow}>
                                <div className={styles.infoRowLeft}>
                                    <User size={14} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Username</span>
                                </div>
                                <span className={styles.infoValue}>{user?.username || '—'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoRowLeft}>
                                    <Mail size={14} className={styles.infoIcon} />
                                    <span className={styles.infoLabel}>Email</span>
                                </div>
                                <span className={styles.infoValue}>{user?.email || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Display Name ── */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Display Name</div>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="Choose a display name"
                                maxLength={30}
                            />
                            <span className={styles.charCount}>{displayName.length}/30</span>
                        </div>
                    </div>

                    {/* ── Avatar Selection ── */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Avatar</div>
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
                                        width={44}
                                        height={44}
                                        className={styles.avatarImg}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className={styles.divider} />

                    {/* ── API Key Section ── */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            <Key size={14} />
                            API Configuration
                        </div>

                        {/* Status indicator */}
                        <div className={styles.apiStatusBanner}>
                            <div className={styles.apiStatusLeft}>
                                <span className={`${styles.statusDot} ${hasApiKey ? styles.statusConnected : styles.statusNotSet}`} />
                                <span className={styles.apiStatusText}>
                                    {hasApiKey ? 'API Key Connected' : 'API Key Not Set'}
                                </span>
                            </div>
                            {hasApiKey && (
                                <div className={styles.apiStorageTag}>
                                    {apiKeyStorage === 'account' ? (
                                        <><Cloud size={12} /> Cloud</>
                                    ) : (
                                        <><Monitor size={12} /> Browser</>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Set / Replace key */}
                        <div className={styles.apiKeyInputGroup}>
                            <div className={styles.apiKeyInputRow}>
                                <div className={styles.apiInputWrapper}>
                                    <Shield size={14} className={styles.apiInputIcon} />
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        className={styles.apiKeyInput}
                                        value={newApiKey}
                                        onChange={e => setNewApiKey(e.target.value)}
                                        placeholder={hasApiKey ? 'Replace existing key...' : 'Paste your API key...'}
                                    />
                                    <button
                                        className={styles.apiToggleVisibility}
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        type="button"
                                    >
                                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Storage mode selector */}
                            <div className={styles.storageModeRow}>
                                <button
                                    className={`${styles.storageModeBtn} ${storageMode === 'browser' ? styles.storageModeActive : ''}`}
                                    onClick={() => setStorageMode('browser')}
                                    type="button"
                                >
                                    <Monitor size={12} />
                                    Browser Only
                                </button>
                                <button
                                    className={`${styles.storageModeBtn} ${storageMode === 'account' ? styles.storageModeActive : ''}`}
                                    onClick={() => setStorageMode('account')}
                                    type="button"
                                >
                                    <Cloud size={12} />
                                    Cloud (Encrypted)
                                </button>
                            </div>

                            <div className={styles.apiActions}>
                                <button
                                    className={styles.apiSaveBtn}
                                    onClick={handleSetApiKey}
                                    disabled={!newApiKey.trim()}
                                >
                                    {hasApiKey ? 'Update Key' : 'Save Key'}
                                </button>
                                {hasApiKey && (
                                    <button
                                        className={styles.apiResetBtn}
                                        onClick={clearApiKey}
                                    >
                                        Remove Key
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
