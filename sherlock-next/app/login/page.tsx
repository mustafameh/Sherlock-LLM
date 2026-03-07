'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/client/contexts/auth';
import styles from '../(auth)/auth.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.success) {
                router.push('/');
            } else {
                setError(data.message || 'Invalid username or password.');
            }
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
                    <p className={styles.authSubtitle}>Sign in to continue your investigation</p>
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
                            placeholder="Enter your username"
                            autoComplete="username"
                            autoFocus
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
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    {error && <div className={styles.errorBox}>{error}</div>}

                    <button
                        className={styles.submitBtn}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className={styles.authFooter}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register">Create one</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
