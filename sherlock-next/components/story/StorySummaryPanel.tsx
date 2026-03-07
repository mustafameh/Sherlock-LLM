import React, { useState, useEffect } from 'react';
import { useSettings } from '@/lib/client/contexts';
import type { StoryBlock } from '@/lib/shared/story/parser';
import { ScrollText, RefreshCw } from 'lucide-react';
import styles from './StorySummary.module.css';

interface StorySummaryPanelProps {
    blocks: StoryBlock[];
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

export default function StorySummaryPanel({ blocks }: StorySummaryPanelProps) {
    const { selectedModel } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [summaryCache, setSummaryCache] = useState<{ text: string; blockCount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = async (forceRegenerate = false) => {
        if (!forceRegenerate && summaryCache && summaryCache.blockCount === blocks.length) {
            return;
        }

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

    // Auto-generate ONLY on the very first open if no cache exists
    useEffect(() => {
        if (isOpen && !summaryCache && !loading && !error) {
            generateSummary(false);
        }
    }, [isOpen, summaryCache, loading, error]);

    const hasNewContent = summaryCache && summaryCache.blockCount < blocks.length;

    return (
        <>
            <button
                className={`${styles.summaryFab} ${loading ? styles.summaryFabLoading : ''}`}
                onClick={() => setIsOpen(true)}
                title="Story Thus Far"
                aria-label="Open story summary"
            >
                <ScrollText size={24} className={loading ? styles.summarySpin : ''} />
                {hasNewContent && !loading && (
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, background: 'var(--color-blue-400)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />
                )}
            </button>

            {isOpen && (
                <div className={styles.summaryBackdrop} onClick={() => setIsOpen(false)}>
                    <div className={styles.summaryPanel} onClick={e => e.stopPropagation()}>
                        <div className={styles.summaryHeader}>
                            <h2 className={styles.summaryTitle}>The Story Thus Far</h2>
                            <button className={styles.summaryCloseBtn} onClick={() => setIsOpen(false)} aria-label="Close">
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
                                    onClick={() => generateSummary(true)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : summaryCache ? (
                            <div className={styles.summaryContent} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <SimpleMarkdown content={summaryCache.text} />

                                    {hasNewContent && (
                                        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
                                            <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-md)', color: 'var(--color-blue-300)' }}>
                                                Story has progressed since this summary.
                                            </p>
                                            <button
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: 'var(--color-blue-600)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'white', fontWeight: 600 }}
                                                onClick={() => generateSummary(true)}
                                            >
                                                <RefreshCw size={16} /> Update Summary
                                            </button>
                                        </div>
                                    )}
                                    {!hasNewContent && (
                                        <button
                                            style={{ marginTop: 'var(--space-4)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            onClick={() => generateSummary(true)}
                                        >
                                            <RefreshCw size={16} /> Regenerate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </>
    );
}
