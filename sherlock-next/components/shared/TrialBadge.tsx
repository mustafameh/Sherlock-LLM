'use client';

import React from 'react';
import { useTrial } from '@/lib/client/contexts';
import styles from './Trial.module.css';

/** Small pill showing how much of the free trial is left. Hidden for visitors with their own key. */
export default function TrialBadge() {
    const { status, onTrial, openNotice } = useTrial();
    if (!onTrial || !status) return null;

    const used = status.exhausted || status.paused;
    const percentLeft = Math.round(((status.remaining ?? 0) / (status.limit || 1)) * 100);
    const label = status.exhausted
        ? 'Free trial used'
        : status.paused
            ? 'Free trial paused'
            : `Free trial · ${percentLeft}% left`;

    return (
        <button
            className={`${styles.badge} ${used ? styles.badgeUsed : ''}`}
            onClick={() => openNotice(status.exhausted ? 'exhausted' : status.paused ? 'paused' : 'info')}
            title="You're playing on the free trial. Click to add your own OpenRouter key."
        >
            <span>{label}</span>
            {!used && (
                <span className={styles.meter} aria-hidden="true">
                    <span className={styles.meterFill} style={{ width: `${percentLeft}%` }} />
                </span>
            )}
        </button>
    );
}
