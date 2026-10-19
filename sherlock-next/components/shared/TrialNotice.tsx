'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useTrial } from '@/lib/client/contexts';
import { AVAILABLE_MODELS } from '@/lib/shared/types';
import ApiKeySection from './ApiKeySection';
import styles from './Trial.module.css';

function modelName(id?: string): string {
    const known = AVAILABLE_MODELS.find(m => m.id === id)?.name;
    return known ? known.replace(/\s*\(.*\)$/, '') : id || 'a hosted model';
}

/** Explains the free trial, and what to do once it's used up: sign up and/or add an OpenRouter key. */
export default function TrialNotice() {
    const { notice, closeNotice, status } = useTrial();
    const { isLoggedIn } = useAuth();
    const pathname = usePathname();

    if (!notice) return null;

    const next = encodeURIComponent(pathname || '/');
    const content = {
        info: {
            title: "You're on the free trial",
            body: `Agent Sherlock is free to try: your first ${(status?.limit ?? 0).toLocaleString('en-GB')} tokens run on the developer's OpenRouter key (${modelName(status?.model)}), enough for a few story scenes or a good conversation with Holmes. Add your own OpenRouter key to play without limits and choose any model.`,
        },
        exhausted: {
            title: 'Your free trial is complete',
            body: "You've used your free trial. Create an account and add your own OpenRouter key to keep playing.",
        },
        paused: {
            title: 'The free trial is resting for today',
            body: 'The free trial has reached its daily limit. Add your own OpenRouter key to keep playing, or come back tomorrow.',
        },
    }[notice];

    return (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeNotice()}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="trial-notice-title">
                <div className={styles.modalHeader}>
                    <h2 id="trial-notice-title" className={styles.modalTitle}>{content.title}</h2>
                    <button className={styles.closeBtn} onClick={closeNotice} aria-label="Close">✕</button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.lead}>{content.body}</p>

                    {!isLoggedIn && (
                        <div className={styles.step}>
                            <span className={styles.stepNum}>1</span>
                            <div className={styles.stepContent}>
                                <h3 className={styles.stepTitle}>Create a free account</h3>
                                <p className={styles.stepText}>Save your stories and keep your key on every device.</p>
                                <div className={styles.stepActions}>
                                    <Link href={`/register?next=${next}`} className={styles.primaryBtn} onClick={closeNotice}>
                                        Create account
                                    </Link>
                                    <Link href={`/login?next=${next}`} className={styles.secondaryLink} onClick={closeNotice}>
                                        I already have one
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.step}>
                        <span className={styles.stepNum}>{isLoggedIn ? 1 : 2}</span>
                        <div className={styles.stepContent}>
                            <h3 className={styles.stepTitle}>Add your OpenRouter key</h3>
                            <p className={styles.stepText}>
                                Get one at{' '}
                                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a>.
                                Free models cost nothing; paid models use your OpenRouter credits.
                            </p>
                            <ApiKeySection compact />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
