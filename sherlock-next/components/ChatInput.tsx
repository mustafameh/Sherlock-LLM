'use client';

import React, { useRef, useCallback } from 'react';
import { useChat, useSettings } from '@/lib/contexts';
import { UIMessage } from '@/lib/types';
import { generateSystemPrompt, parseReActResponse } from '@/lib/agent';
import { toolRegistry } from '@/lib/tools/registry';
import styles from './ChatInput.module.css';

export default function ChatInput() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {
        messages, addMessage, setMessages, currentCharacter, context, isLoading, setIsLoading,
        setChatError, lastFailedText, setLastFailedText,
    } = useChat();
    const { modelSource, selectedModel, apiKey, temperature, deepReasoning } = useSettings();

    const sendMessage = useCallback(async (text: string) => {
        if (!text || isLoading) return;

        setChatError(null);
        setLastFailedText(null);

        const userMsg: UIMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };
        addMessage(userMsg);
        if (textareaRef.current) textareaRef.current.value = '';

        const toolDescriptions = toolRegistry.getToolDescriptions();
        const systemPrompt = generateSystemPrompt(currentCharacter, context, toolDescriptions, deepReasoning);

        const apiMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
            { role: 'user' as const, content: text },
        ];

        setIsLoading(true);

        try {
            if (modelSource === 'openrouter') {
                if (!apiKey) {
                    setMessages(prev => prev.filter(m => m.id !== userMsg.id));
                    setChatError('Please set your OpenRouter API key in the Settings panel (Connection → Bring your own API Key).');
                    setLastFailedText(text);
                    setIsLoading(false);
                    return;
                }

                if (!deepReasoning) {
                    // Direct mode: single API call, no ReAct parsing
                    const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: selectedModel,
                            messages: apiMessages,
                            temperature,
                            apiKey,
                        }),
                    });

                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Failed to get response');
                    }

                    const data = await res.json();
                    const responseText = data.choices?.[0]?.message?.content || data.response || '';

                    addMessage({
                        id: `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: responseText,
                        timestamp: Date.now(),
                    });
                } else {
                    // Deep reasoning: ReAct loop with Thought/Action/Observation parsing
                    let maxIterations = 5;
                    let currentMessages = [...apiMessages];
                    const allSteps: Array<{ type: 'thought' | 'action' | 'observation' | 'final_answer'; content: string; toolName?: string; toolArgs?: Record<string, unknown>; timestamp: number }> = [];

                    while (maxIterations > 0) {
                        maxIterations--;

                        const res = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: selectedModel,
                                messages: currentMessages,
                                temperature,
                                apiKey,
                            }),
                        });

                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || 'Failed to get response');
                        }

                        const data = await res.json();
                        const responseText = data.choices?.[0]?.message?.content || data.response || '';

                        const parsed = parseReActResponse(responseText);

                        for (const step of parsed.steps) {
                            allSteps.push({ ...step, timestamp: Date.now() });
                        }

                        const actionStep = parsed.steps.find(s => s.type === 'action');
                        if (actionStep && actionStep.toolName && toolRegistry.has(actionStep.toolName)) {
                            const observation = await toolRegistry.execute(
                                actionStep.toolName,
                                actionStep.toolArgs || {}
                            );

                            allSteps.push({
                                type: 'observation',
                                content: observation,
                                timestamp: Date.now(),
                            });

                            currentMessages.push(
                                { role: 'assistant' as const, content: responseText },
                                { role: 'user' as const, content: `Observation: ${observation}` }
                            );

                            continue;
                        }

                        const finalAnswer = parsed.finalAnswer || responseText;

                        addMessage({
                            id: `assistant-${Date.now()}`,
                            role: 'assistant',
                            content: finalAnswer,
                            reactSteps: allSteps.length > 0 ? allSteps : undefined,
                            timestamp: Date.now(),
                        });

                        break;
                    }
                }
            } else {
                addMessage({
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: 'Local model inference is not yet connected. Please use OpenRouter API mode.',
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            // Remove the user message that triggered the error
            setMessages(prev => prev.filter(m => m.id !== userMsg.id));
            setChatError(error instanceof Error ? error.message : 'Unknown error');
            setLastFailedText(text);
        } finally {
            setIsLoading(false);
        }
    }, [messages, addMessage, setMessages, currentCharacter, context, isLoading, setIsLoading, modelSource, selectedModel, apiKey, temperature, deepReasoning, setChatError, setLastFailedText]);

    const handleSend = useCallback(async () => {
        const text = textareaRef.current?.value.trim();
        if (!text) return;
        sendMessage(text);
    }, [sendMessage]);

    const handleResend = useCallback(() => {
        if (!lastFailedText) return;
        sendMessage(lastFailedText);
    }, [lastFailedText, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.inputArea}>
            <div className={styles.inputRow}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    rows={1}
                    placeholder="Type your message to Sherlock Holmes..."
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    onChange={() => {
                        if (lastFailedText) setLastFailedText(null);
                    }}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                    }}
                />
                {lastFailedText && !isLoading && (
                    <button
                        className={styles.resendBtn}
                        onClick={handleResend}
                        title="Resend last failed message"
                    >
                        ↻
                    </button>
                )}
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={isLoading}
                    title="Send message"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
