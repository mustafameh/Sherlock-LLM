'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChat, useAuth } from '@/lib/contexts';

/**
 * Auto-save hook: automatically persists the current chat to the server
 * whenever messages change. Uses debouncing to avoid excessive API calls.
 * Only saves when:
 *   - User is logged in
 *   - There are non-system messages
 *   - Messages have actually changed since last save
 */
export function useAutoSave() {
    const { messages, currentChatId, currentCharacter, setCurrentChatId } = useChat();
    const { isLoggedIn } = useAuth();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');
    const savingRef = useRef(false);

    const saveChat = useCallback(async () => {
        if (savingRef.current) return;

        const nonSystem = messages.filter(m => m.role !== 'system');
        if (nonSystem.length === 0) return;

        const fullContent = JSON.stringify(messages);

        // Skip if content hasn't changed
        if (fullContent === lastSavedRef.current) return;

        savingRef.current = true;

        const title = nonSystem[0]?.content.substring(0, 30) + '...';
        const preview = nonSystem[1]?.content || nonSystem[0]?.content || '';
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
                if (!currentChatId && data.id) {
                    setCurrentChatId(data.id);
                }
                lastSavedRef.current = fullContent;
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            savingRef.current = false;
        }
    }, [messages, currentChatId, currentCharacter, setCurrentChatId]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const nonSystem = messages.filter(m => m.role !== 'system');
        if (nonSystem.length === 0) return;

        // Debounce: save 2 seconds after last message change
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            saveChat();
        }, 2000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [messages, isLoggedIn, saveChat]);

    // Reset lastSaved when chat is cleared (new chat)
    useEffect(() => {
        if (messages.length === 0) {
            lastSavedRef.current = '';
        }
    }, [messages]);

    return { saveChat };
}
