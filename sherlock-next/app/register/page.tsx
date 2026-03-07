'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/client/contexts/auth';
import styles from '../(auth)/auth.module.css';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiKeySection, setShowApiKeySection] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/');
        }
    }, [isLoggedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Register the account
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message || 'Registration failed.');
                setLoading(false);
                return;
            }

            // 2. If API key provided, save it to the user profile
            if (apiKey.trim()) {
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: apiKey.trim() }),
                });
            }

            router.push('/');
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoggedIn) return null;

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                {/* Header */}
                <div className={styles.authHeader}>
                    <div className={styles.logoWrap}>
                        <Image src="/logo.png" alt="Agent Sherlock" width={48} height={48} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1 className={styles.authTitle}>Agent Sherlock</h1>
                    <p className={styles.authSubtitle}>Create an account to begin your investigation</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Username</label>
                        <input
                            className={styles.fieldInput}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            placeholder="Choose a username"
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Email</label>
                        <input
                            className={styles.fieldInput}
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Password</label>
                        <div className={styles.passwordWrap}>
                            <input
                                className={styles.fieldInput}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="Choose a password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {/* Optional API Key Section */}
                    <div className={styles.divider}>Setup API Key</div>

                    <div className={styles.optionalSection}>
                        <button
                            type="button"
                            className={styles.optionalToggle}
                            onClick={() => setShowApiKeySection(!showApiKeySection)}
                        >
                            <span>OpenRouter API Key</span>
                            <span className={styles.optionalBadge}>
                                {showApiKeySection ? '▾ Collapse' : '▸ Optional'}
                            </span>
                        </button>

                        {showApiKeySection && (
                            <div className={styles.optionalContent}>
                                <p className={styles.optionalHint}>
                                    Agent Sherlock uses AI models through <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a> to generate interactive stories. You&apos;ll need a free API key to play.
                                </p>
                                <p className={styles.optionalHint}>
                                    <strong>How to get one:</strong> Visit{' '}
                                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a>
                                    , sign up with Google, and create a key. Free models are available — no payment required.
                                </p>
                                <p className={styles.optionalHint}>
                                    You can skip this and set it later from the settings panel.
                                </p>
                                <div className={styles.fieldGroup}>
                                    <input
                                        className={styles.fieldInput}
                                        type="password"
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder="sk-or-v1-..."
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className={styles.errorBox}>{error}</div>}

                    <button
                        className={styles.submitBtn}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div className={styles.authFooter}>
                        Already have an account?{' '}
                        <Link href="/login">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
