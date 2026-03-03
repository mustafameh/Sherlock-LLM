'use client';

import React, { useState } from 'react';
import { UIMessage, ReActStep } from '@/lib/shared/types';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
    message: UIMessage;
    characterName?: string;
}

export default function ChatMessage({ message, characterName }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const speaker = isUser
        ? (characterName || 'You')
        : 'Sherlock Holmes';

    return (
        <div className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                <span className={`${styles.speaker} ${isUser ? styles.userSpeaker : styles.assistantSpeaker}`}>
                    {speaker}
                </span>
                <span className={styles.content}>{message.content}</span>

                {/* ReAct reasoning chain */}
                {!isUser && message.reactSteps && message.reactSteps.length > 0 && (
                    <ReasoningChain steps={message.reactSteps} />
                )}

                {/* TTS button placeholder for assistant messages */}
                {!isUser && (
                    <div className={styles.messageActions}>
                        <button className={styles.audioBtn} title="Text-to-Speech (coming soon)" disabled>
                            🔊
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== ReAct Reasoning Chain =====
function ReasoningChain({ steps }: { steps: ReActStep[] }) {
    const [expanded, setExpanded] = useState(false);

    // Filter out final_answer from the displayed steps (it's already the message content)
    const reasoningSteps = steps.filter(s => s.type !== 'final_answer');

    if (reasoningSteps.length === 0) return null;

    return (
        <div className={styles.reasoningChain}>
            <button
                className={styles.reasoningToggle}
                onClick={() => setExpanded(!expanded)}
            >
                🧠 {expanded ? 'Hide' : 'Show'} reasoning ({reasoningSteps.length} step{reasoningSteps.length !== 1 ? 's' : ''})
            </button>

            {expanded && (
                <div className={styles.reasoningContent}>
                    {reasoningSteps.map((step, i) => (
                        <StepDisplay key={i} step={step} />
                    ))}
                </div>
            )}
        </div>
    );
}

function StepDisplay({ step }: { step: ReActStep }) {
    switch (step.type) {
        case 'thought':
            return (
                <div className={`${styles.step} ${styles.thoughtStep}`}>
                    <div className={styles.thoughtLabel}>💭 Thought</div>
                    {step.content}
                </div>
            );
        case 'action':
            return (
                <div className={`${styles.step} ${styles.actionStep}`}>
                    <div className={styles.actionLabel}>⚡ Action</div>
                    <span className={styles.toolName}>{step.toolName}</span>
                    {step.toolArgs && Object.keys(step.toolArgs).length > 0 && (
                        <div className={styles.toolArgs}>
                            {JSON.stringify(step.toolArgs, null, 2)}
                        </div>
                    )}
                </div>
            );
        case 'observation':
            return (
                <div className={`${styles.step} ${styles.observationStep}`}>
                    <div className={styles.observationLabel}>👁 Observation</div>
                    {step.content}
                </div>
            );
        default:
            return null;
    }
}
