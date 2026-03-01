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
        messages, addMessage, currentCharacter, context, isLoading, setIsLoading,
    } = useChat();
    const { modelSource, selectedModel, apiKey, temperature } = useSettings();

    const handleSend = useCallback(async () => {
        const text = textareaRef.current?.value.trim();
        if (!text || isLoading) return;

        // Add user message
        const userMsg: UIMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };
        addMessage(userMsg);
        if (textareaRef.current) textareaRef.current.value = '';

        // Build system prompt
        const toolDescriptions = toolRegistry.getToolDescriptions();
        const systemPrompt = generateSystemPrompt(currentCharacter, context, toolDescriptions);

        // Build messages for the API
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
                    addMessage({
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: 'Please set your OpenRouter API key in the settings panel.',
                        timestamp: Date.now(),
                    });
                    setIsLoading(false);
                    return;
                }

                // ReAct agent loop
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

                    // Parse the ReAct response
                    const parsed = parseReActResponse(responseText);

                    // Collect steps
                    for (const step of parsed.steps) {
                        allSteps.push({ ...step, timestamp: Date.now() });
                    }

                    // Check if there's an action to execute
                    const actionStep = parsed.steps.find(s => s.type === 'action');
                    if (actionStep && actionStep.toolName && toolRegistry.has(actionStep.toolName)) {
                        // Execute the tool
                        const observation = await toolRegistry.execute(
                            actionStep.toolName,
                            actionStep.toolArgs || {}
                        );

                        allSteps.push({
                            type: 'observation',
                            content: observation,
                            timestamp: Date.now(),
                        });

                        // Add the assistant response and observation to messages for next iteration
                        currentMessages.push(
                            { role: 'assistant' as const, content: responseText },
                            { role: 'user' as const, content: `Observation: ${observation}` }
                        );

                        // Continue the loop
                        continue;
                    }

                    // No action or final answer reached — done
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
            } else {
                // Local model placeholder
                addMessage({
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: 'Local model inference is not yet connected. Please use OpenRouter API mode.',
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            addMessage({
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `My apologies, I encountered an error in my deductions: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: Date.now(),
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages, addMessage, currentCharacter, context, isLoading, setIsLoading, modelSource, selectedModel, apiKey, temperature]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.inputArea}>
            <textarea
                ref={textareaRef}
                className={styles.textarea}
                rows={1}
                placeholder="Type your message to Sherlock Holmes..."
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
            />
            <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={isLoading}
                title="Send message"
            >
                ➤
            </button>
        </div>
    );
}
