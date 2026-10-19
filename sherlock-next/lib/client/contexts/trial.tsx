'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { TRIAL_EVENT } from '@/lib/client/trial';
import { useSettings } from './settings';

export interface TrialStatus {
    enabled: boolean;
    model?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    exhausted?: boolean;
    paused?: boolean;
}

export type TrialNoticeReason = 'info' | 'exhausted' | 'paused';

interface TrialContextType {
    status: TrialStatus | null;
    /** Requests go through the free trial: the visitor has no key and the trial is configured. */
    onTrial: boolean;
    /** On the trial and it can still take requests. */
    trialAvailable: boolean;
    notice: TrialNoticeReason | null;
    openNotice: (reason: TrialNoticeReason) => void;
    closeNotice: () => void;
    refreshTrial: () => Promise<void>;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

async function fetchTrialStatus(): Promise<TrialStatus | null> {
    try {
        const res = await fetch('/api/trial', { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export function TrialProvider({ children }: { children: ReactNode }) {
    const { apiKey } = useSettings();
    const [status, setStatus] = useState<TrialStatus | null>(null);
    const [notice, setNotice] = useState<TrialNoticeReason | null>(null);

    const refreshTrial = useCallback(async () => {
        const next = await fetchTrialStatus();
        if (next) setStatus(next);
    }, []);

    useEffect(() => {
        if (apiKey) return;
        let active = true;
        fetchTrialStatus().then(next => {
            if (active && next) setStatus(next);
        });
        return () => { active = false; };
    }, [apiKey]);

    useEffect(() => {
        const handle = (event: Event) => {
            const code = (event as CustomEvent<{ code?: string }>).detail?.code;
            if (code === 'TRIAL_EXHAUSTED') setNotice('exhausted');
            else if (code === 'TRIAL_PAUSED') setNotice('paused');
            refreshTrial();
        };
        window.addEventListener(TRIAL_EVENT, handle);
        return () => window.removeEventListener(TRIAL_EVENT, handle);
    }, [refreshTrial]);

    const onTrial = !apiKey && !!status?.enabled;
    const trialAvailable = onTrial && !status?.exhausted && !status?.paused;

    const openNotice = useCallback((reason: TrialNoticeReason) => setNotice(reason), []);
    const closeNotice = useCallback(() => setNotice(null), []);

    return (
        <TrialContext.Provider value={{
            status, onTrial, trialAvailable,
            // Adding a key ends the trial, so the notice has nothing left to say.
            notice: apiKey ? null : notice,
            openNotice, closeNotice, refreshTrial,
        }}>
            {children}
        </TrialContext.Provider>
    );
}

export function useTrial() {
    const ctx = useContext(TrialContext);
    if (!ctx) throw new Error('useTrial must be used within TrialProvider');
    return ctx;
}
