import React, { useState, useEffect } from 'react';
import { useSettings } from '@/lib/client/contexts';
import type { StoryBlock } from '@/lib/shared/story/parser';
import { ScrollText, RefreshCw, ChevronDown, Milestone, Fingerprint, Users, HelpCircle, CheckCircle2, LucideIcon } from 'lucide-react';
import styles from './StorySummary.module.css';

interface StorySummaryPanelProps {
    blocks: StoryBlock[];
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    // Determine the thematic icon based on the section title
    let Icon: LucideIcon = ScrollText;
    if (title.toLowerCase().includes('situation')) Icon = Milestone;
    else if (title.toLowerCase().includes('characters')) Icon = Users;
    else if (title.toLowerCase().includes('clues') || title.toLowerCase().includes('evidence')) Icon = Fingerprint;
    else if (title.toLowerCase().includes('decisions')) Icon = CheckCircle2;
    else if (title.toLowerCase().includes('unresolved')) Icon = HelpCircle;

    return (
        <details className={styles.accordion} open={defaultOpen}>
            <summary className={styles.accordionSummary}>
                <div className={styles.accordionIconWrapper}>
                    <Icon size={18} className={styles.secIcon} />
                    {title}
                </div>
                <ChevronDown size={18} className={styles.accordionIcon} />
            </summary>
            <div className={styles.accordionContent}>
                {children}
            </div>
        </details>
    );
}

// Simple markdown renderer tailored for the rigid summary structure
function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const sections: { title: string; elements: React.ReactNode[] }[] = [];

    let currentTitle = "Summary";
    let currentElements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            currentElements.push(<ul key={`ul-${currentElements.length}`}>{currentList}</ul>);
            currentList = [];
        }
    };

    const flushSection = (newTitle: string) => {
        flushList();
        if (currentElements.length > 0 || currentTitle !== "Summary") {
            sections.push({ title: currentTitle, elements: currentElements });
        }
        currentTitle = newTitle;
        currentElements = [];
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('### ')) {
            flushSection(trimmed.substring(4));
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            currentList.push(<li key={`li-${index}`}>{trimmed.substring(2)}</li>);
        } else {
            flushList();
            currentElements.push(<p key={`p-${index}`}>{trimmed}</p>);
        }
    });
    flushSection(""); // flush final

    return (
        <div className={styles.accordionList}>
            {sections.map((sec, i) => (
                <AccordionSection key={i} title={sec.title} defaultOpen={i === 0}>
                    {sec.elements}
                </AccordionSection>
            ))}
        </div>
    );
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

    const sceneDiff = summaryCache ? blocks.length - summaryCache.blockCount : 0;
    const hasNewContent = sceneDiff > 0;

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
                            <ScrollText size={28} className={styles.summaryHeaderIcon} />
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
                            <>
                                <div className={styles.summaryContent}>
                                    <SimpleMarkdown content={summaryCache.text} />
                                </div>
                                <div className={styles.summaryFooter}>
                                    {hasNewContent ? (
                                        <>
                                            <span className={styles.summaryLastUpdated}>
                                                Last updated {sceneDiff} scene{sceneDiff !== 1 ? 's' : ''} ago
                                            </span>
                                            <button className={styles.summaryUpdateBtn} onClick={() => generateSummary(true)}>
                                                <RefreshCw size={16} /> Update Summary
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.summaryLastUpdated} style={{ opacity: 0.5 }}>
                                                Up to date
                                            </span>
                                            <button
                                                className={styles.summaryUpdateBtn}
                                                onClick={() => generateSummary(true)}
                                                style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                                            >
                                                <RefreshCw size={16} /> Regenerate
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </>
    );
}
