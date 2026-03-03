'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useChat, useAuth } from '@/lib/client/contexts';
import { AVATAR_OPTIONS, SavedChat } from '@/lib/shared/types';
import EditProfileModal from '@/components/shared/EditProfileModal';
import styles from './SidebarLeft.module.css';

export default function SidebarLeft() {
    const { messages, currentChatId, currentCharacter, clearChat, setMessages, setCurrentChatId, setCurrentCharacter, characters } = useChat();
    const { user, isLoggedIn } = useAuth();
    const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
    const [collapsed, setCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const userAvatarSrc = AVATAR_OPTIONS.find(a => a.id === user?.avatar)?.src || '/avatars/detective.svg';

    const fetchSavedChats = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await fetch('/api/chats?type=roleplay');
            if (res.ok) {
                const data = await res.json();
                setSavedChats(data);
            }
        } catch (error) {
            console.error('Error fetching saved chats:', error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchSavedChats();
    }, [fetchSavedChats]);

    // Refresh chat list when currentChatId changes (e.g. after auto-save creates a new chat)
    useEffect(() => {
        fetchSavedChats();
    }, [currentChatId, fetchSavedChats]);

    const handleNewChat = () => {
        clearChat();
    };

    const handleLoadChat = async (chatId: string) => {
        if (chatId === currentChatId) return;
        try {
            const res = await fetch(`/api/chats/${chatId}`);
            if (!res.ok) throw new Error('Failed to load chat');
            const chat = await res.json();

            clearChat();
            const loadedMessages = JSON.parse(chat.full_content);
            setMessages(loadedMessages);
            setCurrentChatId(chatId);

            const char = characters.find(c => c.name === chat.character);
            if (char) setCurrentCharacter(char);

            if (window.innerWidth <= 768) setCollapsed(true);
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
            fetchSavedChats();
            if (currentChatId === chatId) clearChat();
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
        setConfirmDelete(null);
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <>
            {!collapsed && isMobile && (
                <div className={styles.backdrop} onClick={() => setCollapsed(true)} />
            )}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                {/* Toggle button */}
                <button
                    className={styles.toggleBtn}
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '☰' : '✕'}
                </button>

                {!collapsed && (
                    <>
                        {/* New Chat Button */}
                        <button className={styles.newChatBtn} onClick={handleNewChat}>
                            <span className={styles.newChatIcon}>+</span>
                            New Chat
                        </button>

                        {/* Chat History */}
                        <div className={styles.chatList}>
                            <div className={styles.sectionLabel}>Chat History</div>
                            {savedChats.length === 0 ? (
                                <div className={styles.emptyState}>
                                    No saved chats yet
                                </div>
                            ) : (
                                savedChats.map(chat => (
                                    <div
                                        key={chat.id}
                                        className={`${styles.chatItem} ${currentChatId === chat.id ? styles.chatItemActive : ''}`}
                                        onClick={() => handleLoadChat(chat.id)}
                                    >
                                        <div className={styles.chatTitle}>{chat.title}</div>
                                        <div className={styles.chatMeta}>
                                            <span className={styles.chatCharacter}>{chat.character}</span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(chat.id); }}
                                                title="Delete chat"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* User Profile Footer */}
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

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Delete Chat?</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteChat(confirmDelete)}>Delete</button>
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
