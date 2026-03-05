'use client';

import React, { useState, useEffect } from 'react';

const LOADING_PHRASES = [
    "Consulting the index...",
    "Gathering clues...",
    "Setting the scene in 1895...",
    "Lighting the gas lamps...",
    "Waking Dr. Watson...",
    "Analyzing the initial premises..."
];

export default function LoadingDemo1() {
    const [isLoading, setIsLoading] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => {
            setPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', color: 'white', fontFamily: 'sans-serif' }}>
            <h1 style={{ marginBottom: '40px', color: '#f59e0b' }}>Option 1: Thematic Pulse 🔍</h1>

            <div style={{ background: 'rgba(20,25,40,0.8)', padding: '60px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '400px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {!isLoading ? (
                    <button
                        onClick={() => { setIsLoading(true); setPhraseIndex(0); }}
                        style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
                    >
                        Begin the Story
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        {/* CSS Pulse Animation */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes pulse-glow {
                                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                                70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); }
                                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                            }
                            @keyframes fade-in-out {
                                0% { opacity: 0; transform: translateY(5px); }
                                20% { opacity: 1; transform: translateY(0); }
                                80% { opacity: 1; transform: translateY(0); }
                                100% { opacity: 0; transform: translateY(-5px); }
                            }
                        `}} />

                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '2px solid #f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px',
                            animation: 'pulse-glow 2s infinite'
                        }}>
                            🔎
                        </div>

                        <div style={{ height: '30px', position: 'relative', width: '100%' }}>
                            <p key={phraseIndex} style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontStyle: 'italic', animation: 'fade-in-out 2s forwards', position: 'absolute', width: '100%', textAlign: 'center' }}>
                                {LOADING_PHRASES[phraseIndex]}
                            </p>
                        </div>

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
    );
}
