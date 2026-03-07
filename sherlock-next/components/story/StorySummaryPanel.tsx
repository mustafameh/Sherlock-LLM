import React, { useState, useEffect } from 'react';
import { useSettings } from '@/lib/client/contexts';
import type { StoryBlock } from '@/lib/shared/story/parser';
import styles from './StorySummary.module.css';

interface StorySummaryPanelProps {
    blocks: StoryBlock[];
    isOpen: boolean;
    onClose: () => void;
}

// Simple markdown renderer tailored for the rigid summary structure
function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`}>{currentList}</ul>);
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={`h3-${index}`}>{trimmed.substring(4)}</h3>);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            currentList.push(<li key={`li-${index}`}>{trimmed.substring(2)}</li>);
        } else {
            flushList();
            elements.push(<p key={`p-${index}`}>{trimmed}</p>);
        }
    });
    flushList();

    return <div className={styles.summaryContent}>{elements}</div>;
}

export default function StorySummaryPanel({ blocks, isOpen, onClose }: StorySummaryPanelProps) {
    const { selectedModel } = useSettings();
    const [summaryCache, setSummaryCache] = useState<{ text: string; blockCount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // If we already have a cache for this exact block count, don't regenerate
        if (summaryCache && summaryCache.blockCount === blocks.length) {
            return;
        }

        const generateSummary = async () => {
            setLoading(true);
            setError(null);

            try {
                // Compile the story text for the LLM
                const currentStoryText = blocks.map(b => {
                    if (b.type === 'narrator') return b.content;
                    if (b.type === 'dialogue') return `${b.character}: ${b.content}`;
                    if (b.type === 'user_action') return `User Action: ${b.content}`;
                    if (b.type === 'decision') return `Options presented: ${b.options.join(' | ')}`;
                    return '';
                }).filter(Boolean).join('\n\n');

                if (!currentStoryText.trim()) {
                    setSummaryCache({ text: 'No story context available yet.', blockCount: blocks.length });
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/story/summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentStoryText, model: selectedModel }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to generate summary');
                }

                setSummaryCache({ text: data.summary, blockCount: blocks.length });
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching the summary.');
            } finally {
                setLoading(false);
            }
        };

        generateSummary();
    }, [isOpen, blocks, selectedModel, summaryCache]);

    if (!isOpen) return null;

    return (
        <div className={styles.summaryBackdrop} onClick={onClose}>
            <div className={styles.summaryPanel} onClick={e => e.stopPropagation()}>
                <div className={styles.summaryHeader}>
                    <h2 className={styles.summaryTitle}>The Story Thus Far</h2>
                    <button className={styles.summaryCloseBtn} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className={styles.summaryLoading} style={{ padding: '20px' }}>
                        <div className={styles.skeletonBlock}>
                            <div className={styles.skeletonTitle}></div>
                            <div className={styles.skeletonText}></div>
                            <div className={`${styles.skeletonText} ${styles.short}`}></div>
                        </div>
                        <div className={styles.skeletonBlock}>
                            <div className={styles.skeletonTitle}></div>
                            <div className={styles.skeletonText}></div>
                            <div className={styles.skeletonText}></div>
                        </div>
                        <div className={styles.skeletonBlock}>
                            <div className={styles.skeletonTitle}></div>
                            <div className={styles.skeletonText}></div>
                            <div className={styles.skeletonText}></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className={styles.summaryContent}>
                        <div style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                            {error}
                        </div>
                        <button
                            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                            onClick={() => {
                                setSummaryCache(null);
                                setError(null);
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : summaryCache ? (
                    <SimpleMarkdown content={summaryCache.text} />
                ) : null}
            </div>
        </div>
    );
}
