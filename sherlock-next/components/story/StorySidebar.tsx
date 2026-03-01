'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStory } from '@/lib/storyContext';
import { useAuth } from '@/lib/contexts';
import { AVATAR_OPTIONS } from '@/lib/types';
import EditProfileModal from '@/components/EditProfileModal';
import styles from './StorySidebar.module.css';

export default function StorySidebar() {
    const {
        savedStories,
        currentStoryId,
        loadStory,
        deleteStory,
        resetStory,
        isStoryStarted,
    } = useStory();
    const { user, isLoggedIn } = useAuth();
    const [collapsed, setCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const userAvatarSrc = AVATAR_OPTIONS.find(a => a.id === user?.avatar)?.src || '/avatars/detective.svg';
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const handleLoadStory = (id: string) => {
        if (id === currentStoryId) return;
        loadStory(id);
        if (isMobile) setCollapsed(true);
    };

    const handleDeleteStory = async (id: string) => {
        await deleteStory(id);
        setConfirmDelete(null);
    };

    return (
        <>
            {!collapsed && isMobile && (
                <div className={styles.backdrop} onClick={() => setCollapsed(true)} />
            )}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '☰' : '✕'}
                </button>

                {!collapsed && (
                    <>
                        <button className={styles.newStoryBtn} onClick={resetStory}>
                            <span className={styles.newStoryIcon}>+</span>
                            New Story
                        </button>

                        <div className={styles.storyList}>
                            <div className={styles.sectionLabel}>Story History</div>
                            {!isLoggedIn ? (
                                <div className={styles.emptyState}>
                                    Log in to save stories
                                </div>
                            ) : savedStories.length === 0 ? (
                                <div className={styles.emptyState}>
                                    No saved stories yet
                                </div>
                            ) : (
                                savedStories.map(story => (
                                    <div
                                        key={story.id}
                                        className={`${styles.storyItem} ${currentStoryId === story.id ? styles.storyItemActive : ''}`}
                                        onClick={() => handleLoadStory(story.id)}
                                    >
                                        <div className={styles.storyTitle}>{story.title}</div>
                                        <div className={styles.storyMeta}>
                                            <span className={styles.storyCharacter}>{story.character}</span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(story.id); }}
                                                title="Delete story"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {isLoggedIn && user && (
                            <div className={styles.userFooter} onClick={() => setShowProfileModal(true)}>
                                <Image
                                    src={userAvatarSrc}
                                    alt="Avatar"
                                    width={36}
                                    height={36}
                                    style={{ borderRadius: '50%', flexShrink: 0 }}
                                />
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{user.displayName || user.username}</div>
                                    <div className={styles.userEmail}>{user.email}</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </aside>

            {confirmDelete && (
                <div className="overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Delete Story?</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteStory(confirmDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showProfileModal && (
                <EditProfileModal onClose={() => setShowProfileModal(false)} />
            )}
        </>
    );
}
