'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@/lib/client/contexts';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

export default function ChatWindow() {
    const { messages, currentCharacter, isLoading } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const visibleMessages = messages.filter(m => m.role !== 'system');

    return (
        <div className={styles.chatWindow}>
            {visibleMessages.length === 0 && !isLoading && (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <div className={styles.emptyTitle}>The game is afoot!</div>
                    <div className={styles.emptyHint}>
                        Send a message to begin your consultation with Sherlock Holmes.
                        He will use his powers of deduction and reasoning to assist you.
                    </div>
                </div>
            )}

            {visibleMessages.map((msg) => (
                <ChatMessage
                    key={msg.id}
                    message={msg}
                    characterName={currentCharacter?.name}
                />
            ))}

            {isLoading && (
                <div className={`${styles.chatWindow}`} style={{ padding: 0, flex: 'none' }}>
                    <LoadingIndicator />
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

function LoadingIndicator() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 'var(--space-3)',
            animation: 'fadeIn 300ms ease-out',
        }}>
            <div style={{
                background: 'var(--bg-assistant-bubble)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                borderBottomLeftRadius: 'var(--radius-sm)',
                padding: 'var(--space-3) var(--space-4)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-navy-600)',
                    display: 'block',
                    marginBottom: '4px',
                }}>
                    Sherlock Holmes
                </span>
                <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{ display: 'flex', gap: '3px' }}>
                        <span style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0s' }}>●</span>
                        <span style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }}>●</span>
                        <span style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }}>●</span>
                    </span>
                    Contemplating...
                </span>
            </div>
        </div>
    );
}
