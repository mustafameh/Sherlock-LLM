'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useChat, useAuth } from '@/lib/client/contexts';
import { SavedChat } from '@/lib/shared/types';

export default function ChatControls() {
    const { messages, currentChatId, currentCharacter, clearChat, setMessages, setCurrentChatId, setCurrentCharacter, characters } = useChat();
    const { isLoggedIn } = useAuth();
    const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
    const [confirmAction, setConfirmAction] = useState<{ type: string; id?: string } | null>(null);

    const fetchSavedChats = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await fetch('/api/chats');
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

    const handleStartNew = () => {
        if (messages.length > 0) {
            setConfirmAction({ type: 'new' });
        } else {
            clearChat();
        }
    };

    const handleSaveChat = async () => {
        if (!isLoggedIn) {
            alert('Please login to save chats.');
            return;
        }
        if (messages.filter(m => m.role !== 'system').length === 0) {
            alert('No messages to save.');
            return;
        }

        const nonSystem = messages.filter(m => m.role !== 'system');
        const title = nonSystem[0]?.content.substring(0, 30) + '...';
        const preview = nonSystem[1]?.content || nonSystem[0]?.content || '';
        const fullContent = JSON.stringify(messages);
        const character = currentCharacter?.name || 'Dr. Watson';

        try {
            const url = currentChatId ? `/api/chats/${currentChatId}` : '/api/chats';
            const method = currentChatId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, preview, full_content: fullContent, character }),
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentChatId(data.id);
                fetchSavedChats();
            }
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    };

    const handleLoadChat = async (chatId: string) => {
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
    };

    return (
        <>
            {/* Controls bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-light)',
            }}>
                <button className="btn btn-teal btn-sm" onClick={handleStartNew}>
                    + New Chat
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveChat}>
                    💾 Save Chat
                </button>
            </div>

            {/* Saved chats */}
            {savedChats.length > 0 && (
                <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-tertiary)',
                    borderTop: '1px solid var(--border-light)',
                }}>
                    <div style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.08em',
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-2)',
                    }}>
                        Saved Chats
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        overflowX: 'auto',
                        paddingBottom: 'var(--space-2)',
                    }}>
                        {savedChats.map(chat => (
                            <div
                                key={chat.id}
                                className="card"
                                style={{
                                    flex: '0 0 200px',
                                    padding: 'var(--space-3)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'transform var(--transition-fast)',
                                }}
                                onClick={() => handleLoadChat(chat.id)}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = '')}
                            >
                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {chat.title}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {chat.preview}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                                    <span className="badge badge-blue">{chat.character}</span>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--color-error)', padding: '2px 6px' }}
                                        onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'delete', id: chat.id }); }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                    {new Date(chat.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirm dialog */}
            {confirmAction && (
                <div className="overlay" onClick={() => setConfirmAction(null)}>
                    <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                                {confirmAction.type === 'new' ? 'Start New Chat?' : 'Delete Chat?'}
                            </h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                {confirmAction.type === 'new'
                                    ? 'Any unsaved changes will be lost.'
                                    : 'This action cannot be undone.'
                                }
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
                            <button
                                className={`btn ${confirmAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => {
                                    if (confirmAction.type === 'new') clearChat();
                                    if (confirmAction.type === 'delete' && confirmAction.id) handleDeleteChat(confirmAction.id);
                                    setConfirmAction(null);
                                }}
                            >
                                {confirmAction.type === 'new' ? 'Start New' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
