'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                setError(data.message || 'Login failed');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #060b14 0%, #0B1120 50%, #0F172A 100%)',
            padding: 'var(--space-4)',
        }}>
            <div style={{ maxWidth: 420, width: '100%' }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(11, 17, 32, 0.8)',
                    backdropFilter: 'blur(16px)',
                    color: 'var(--text-inverse)',
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-4)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{
                        width: 64, height: 64,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 8,
                    }}>
                        <Image src="/logo.png" alt="Sherlock Holmes Logo" width={48} height={48} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    }}>
                        Sherlock Holmes AI
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-300)' }}>
                        Sign in to continue your investigation
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    padding: 'var(--space-6)',
                    borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderTop: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                }}>
                    <div>
                        <label className="label">Username</label>
                        <input
                            className="input"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--space-2) var(--space-3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: '#fca5a5',
                            fontSize: 'var(--text-sm)',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: 'var(--space-3)', fontSize: 'var(--text-base)' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-navy-300)',
                    }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--color-blue-400)', fontWeight: 500 }}>
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
