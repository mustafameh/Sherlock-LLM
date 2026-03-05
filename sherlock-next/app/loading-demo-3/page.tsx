'use client';

import React, { useState } from 'react';

export default function LoadingDemo3() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif' }}>
            <h1 style={{ marginBottom: '40px', color: '#3b82f6' }}>Option 3: Abstract Glassmorphism ✨</h1>

            <div style={{ background: 'rgba(20,25,40,0.8)', padding: '60px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '400px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes spin-slow {
                                100% { transform: rotate(360deg); }
                            }
                            @keyframes morph {
                                0% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
                                34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
                                67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
                                100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
                            }
                        `}} />
                        <div style={{
                            position: 'absolute', width: '200px', height: '200px',
                            background: 'linear-gradient(45deg, rgba(59,130,246,0.6), rgba(245,158,11,0.6))',
                            filter: 'blur(30px)',
                            animation: 'spin-slow 6s linear infinite, morph 8s ease-in-out infinite',
                        }} />
                        <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(20px)', background: 'rgba(10,15,30,0.4)' }} />
                    </div>
                )}

                <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {!isLoading ? (
                        <button
                            onClick={() => setIsLoading(true)}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}
                        >
                            Begin the Story
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                border: '3px solid rgba(255,255,255,0.1)',
                                borderTopColor: '#3b82f6',
                                borderRightColor: '#f59e0b',
                                borderRadius: '50%',
                                animation: 'spin-slow 1s linear infinite'
                            }} />

                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, letterSpacing: '1px' }}>Initializing Story Engine</h3>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Weaving threads of mystery...</p>

                            <button
                                onClick={() => setIsLoading(false)}
                                style={{ marginTop: '20px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                (Reset Demo)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
