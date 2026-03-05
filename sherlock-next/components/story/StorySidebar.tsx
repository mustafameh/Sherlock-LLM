'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStory } from '@/lib/client/story/context';
import { useAuth } from '@/lib/client/contexts';
import { AVATAR_OPTIONS } from '@/lib/shared/types';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import EditProfileModal from '@/components/shared/EditProfileModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
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
    const [collapsed, setCollapsed] = useState(true);
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
                {/* Header */}
                <div className={styles.header}>
                    {!collapsed && (
                        <div className={styles.branding}>
                            <Image
                                src="/logo.png"
                                alt="Agent Sherlock"
                                width={28}
                                height={28}
                                className={styles.logoImg}
                            />
                            <div className={styles.brandText}>
                                <span className={styles.brandName}>Agent Sherlock</span>
                                <span className={styles.brandSub}>Interactive Story Mode</span>
                            </div>
                        </div>
                    )}
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                {!collapsed && (
                    <div className={styles.content}>
                        {/* New Story - Glowing CTA */}
                        <button className={styles.newStoryBtn} onClick={resetStory}>
                            <span className={styles.newStoryIcon}>+</span>
                            New Story
                        </button>

                        {/* Story List */}
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
                    </div>
                )}

                {/* User Footer */}
                {!collapsed && isLoggedIn && user && (
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
            </aside>

            {confirmDelete && (
                <ConfirmDeleteModal
                    title="Delete Story?"
                    onConfirm={() => handleDeleteStory(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {showProfileModal && (
                <EditProfileModal onClose={() => setShowProfileModal(false)} />
            )}
        </>
    );
}
