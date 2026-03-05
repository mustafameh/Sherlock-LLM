'use client';

import React, { useState, useEffect } from 'react';

export default function LoadingDemo2() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                const step = Math.random() * 8;
                if (prev + step >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + step;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', color: 'white', fontFamily: 'serif' }}>
            <h1 style={{ marginBottom: '40px', color: '#f59e0b', fontFamily: 'sans-serif' }}>Option 2: Typewriter Progression ✒️</h1>

            <div style={{ background: 'rgba(20,25,40,0.8)', padding: '60px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '450px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {!isLoading ? (
                    <button
                        onClick={() => setIsLoading(true)}
                        style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' }}
                    >
                        Begin the Story
                    </button>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes cursor-blink {
                                0%, 100% { opacity: 1; }
                                50% { opacity: 0; }
                            }
                        `}} />

                        <div style={{ textAlign: 'left', minHeight: '60px', fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', letterSpacing: '0.5px' }}>
                            Watson, the game is afoot. Prepare the carriage immediately, we haven&apos;t a moment to lose...
                            <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#f59e0b', marginLeft: '4px', verticalAlign: 'middle', animation: 'cursor-blink 1s infinite' }} />
                        </div>

                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontFamily: 'sans-serif' }}>
                                <span>Generating Narrative</span>
                                <span>{Math.floor(progress)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #b45309, #f59e0b)', transition: 'width 0.3s ease-out' }} />
                            </div>
                        </div>

                        <button
                            onClick={() => setIsLoading(false)}
                            style={{ alignSelf: 'center', marginTop: '20px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'sans-serif' }}
                        >
                            (Reset Demo)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
