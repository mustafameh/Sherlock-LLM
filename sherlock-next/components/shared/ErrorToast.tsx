'use client';

import React, { useEffect, useCallback } from 'react';
import { useChat } from '@/lib/client/contexts';
import styles from './ErrorToast.module.css';

export default function ErrorToast() {
    const { chatError, setChatError } = useChat();

    const handleDismiss = useCallback(() => {
        setChatError(null);
    }, [setChatError]);

    useEffect(() => {
        if (!chatError) return;
        const timer = setTimeout(handleDismiss, 15000);
        return () => clearTimeout(timer);
    }, [chatError, handleDismiss]);

    const handleCopy = async () => {
        if (!chatError) return;
        try {
            await navigator.clipboard.writeText(chatError);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = chatError;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    };

    if (!chatError) return null;

    return (
        <div className={styles.toast}>
            <div className={styles.errorText}>{chatError}</div>
            <div className={styles.actions}>
                <button className={styles.copyBtn} onClick={handleCopy}>
                    📋 Copy Error
                </button>
                <button className={styles.dismissBtn} onClick={handleDismiss}>
                    ✕ Dismiss
                </button>
            </div>
        </div>
    );
}
