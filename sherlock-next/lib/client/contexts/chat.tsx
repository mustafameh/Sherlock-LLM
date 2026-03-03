'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { UIMessage, Character } from '@/lib/shared/types';
import { DEFAULT_CHARACTERS } from '@/lib/shared/characters';

interface ChatContextType {
    messages: UIMessage[];
    currentChatId: string | null;
    currentCharacter: Character | null;
    characters: Character[];
    context: string;
    isLoading: boolean;
    chatError: string | null;
    lastFailedText: string | null;
    addMessage: (msg: UIMessage) => void;
    setMessages: (msgs: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
    setCurrentChatId: (id: string | null) => void;
    setCurrentCharacter: (char: Character | null) => void;
    setCharacters: (chars: Character[]) => void;
    addCharacter: (char: Character) => void;
    setContext: (ctx: string) => void;
    setIsLoading: (loading: boolean) => void;
    setChatError: (err: string | null) => void;
    setLastFailedText: (text: string | null) => void;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(DEFAULT_CHARACTERS[0]);
    const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [lastFailedText, setLastFailedText] = useState<string | null>(null);

    const addMessage = useCallback((msg: UIMessage) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const addCharacter = useCallback((char: Character) => {
        setCharacters(prev => [...prev, char]);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
    }, []);

    return (
        <ChatContext.Provider value={{
            messages, currentChatId, currentCharacter, characters, context, isLoading,
            chatError, lastFailedText,
            addMessage, setMessages, setCurrentChatId, setCurrentCharacter, setCharacters,
            addCharacter, setContext, setIsLoading, setChatError, setLastFailedText, clearChat,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}
