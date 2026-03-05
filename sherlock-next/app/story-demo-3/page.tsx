'use client';

import React, { useState } from 'react';

/*
 * OPTION 3: "Theatrical Spotlight" — Visual drama and atmosphere.
 *
 * KEEPS: Sidebar, header, story window, decisions, quick actions, text input.
 *
 * IMPROVES:
 * - Narrator text is the star — larger, centered, with a "spotlight" vignette effect.
 * - Dialogue gets a more dramatic presentation: larger character name,
 *   the speech has a slight glow/highlight on hover to feel "alive."
 * - Decisions are presented as dramatic "moment of choice" cards with a 
 *   brief fade-in animation and a gold accent line.
 * - A persistent "atmosphere strip" at the bottom of the story window shows 
 *   the current mood/location/time with soft icons.
 * - Scene transitions have a subtle divider between previous/current content.
 * - The input area is more compact, letting the story fill the screen.
 */

const NARRATOR_BLOCKS = [
    'Bradstreet led us down a corridor to a heavy oak door. It was indeed locked, a stout key still in the mechanism on the inside. The Inspector produced a master key, unlocked it from the outside, and with a creak, the door swung open to reveal the scene within.',
    'The study was a library of chaos. Lord Blackwood lay sprawled on the Persian rug before his desk, one hand clutched at his chest. His face was a mask of shock. A fallen glass lay near his hand, a dark residue in its bowl. The room\'s single large window was shut fast against the storm, but a cold draft seemed to whisper from somewhere. Books were scattered, as if from a struggle, yet the door had been locked from within.',
];

const DIALOGUE_BLOCKS = [
    { character: 'Sherlock Holmes', content: '"Do not enter!" Holmes commanded, dropping to his knees at the threshold. His lens was out in an instant, scanning the floor, the keyhole, the edges of the door. "Observe, Watson. The key is in the lock. The tumblers are undisturbed. The window latch is secured. Yet, a man lies dead. How?"' },
];

const DECISIONS = [
    'Examine the body more closely for cause of death.',
    'Inspect the contents of the glass and the dark residue.',
    'Ask Inspector Bradstreet about the guests\' accounts of the evening.',
    'Search the room for any unusual object or disturbance.',
];

export default function StoryDemo3() {
    const [hoveredDecision, setHoveredDecision] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#080c16', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
            {/* Sidebar */}
            {sidebarOpen && (
                <aside style={{
                    width: '220px', background: '#0a0e1a', borderRight: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔍</span>
                            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>Agent Sherlock</span>
                        </div>
                        <button style={{
                            width: '100%', padding: '10px', background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px',
                            color: '#f5d090', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
                        }}>
                            + New Story
                        </button>
                    </div>
                    <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Story History</span>
                        {['A Murder at the Manor', 'The Clockwork Corpse', 'The Blackmail Letters'].map((title, i) => (
                            <div key={i} style={{
                                padding: '10px 8px', marginTop: '4px', borderRadius: '6px', cursor: 'pointer',
                                background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                                borderLeft: i === 0 ? '2px solid #f59e0b' : '2px solid transparent',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#c8cdd5', fontWeight: i === 0 ? 600 : 400 }}>{title}</p>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Dr. Watson</span>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header — minimal */}
                <header style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(8,12,22,0.9)', backdropFilter: 'blur(12px)', minHeight: '44px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', cursor: 'pointer' }}>☰</button>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>← Home</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>A Murder at the Manor</span>
                        <span style={{ color: '#60a5fa', fontSize: '0.8rem' }}>Dr. Watson</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Scene 3 of 3</span>
                        <button style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.85rem' }}>⚙</button>
                    </div>
                </header>

                {/* Demo badge */}
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(168,85,247,0.06)', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>Option 3: Theatrical Spotlight</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>— Dramatic presentation, centered text, atmospheric vignette, compact input</span>
                </div>

                {/* Story Content — with spotlight vignette */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '48px 32px', display: 'flex', justifyContent: 'center',
                    position: 'relative',
                }}>
                    {/* Spotlight vignette overlay */}
                    <div style={{
                        position: 'fixed', inset: 0, pointerEvents: 'none',
                        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.6)', zIndex: 1,
                    }} />

                    <div style={{ maxWidth: '650px', width: '100%', position: 'relative', zIndex: 2 }}>
                        {/* Atmosphere strip — location & mood */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px',
                            fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px',
                        }}>
                            <span>📍 Blackwood Manor — Study</span>
                            <span>🕐 Late Night</span>
                            <span style={{ color: 'rgba(239,68,68,0.4)' }}>⚠ Danger</span>
                        </div>

                        {/* Narrator — centered, dramatic, big */}
                        {NARRATOR_BLOCKS.map((text, i) => (
                            <p key={`n${i}`} style={{
                                fontFamily: 'Georgia, "Playfair Display", serif',
                                fontStyle: 'italic', fontSize: '1.2rem', lineHeight: 1.9,
                                color: '#9aa3b5', margin: '0 0 36px 0', textAlign: 'center',
                            }}>
                                {text}
                            </p>
                        ))}

                        {/* Scene break ornament */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', margin: '32px 0' }}>
                            <span style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3))' }} />
                            <span style={{ color: 'rgba(245,158,11,0.3)', fontSize: '0.8rem' }}>◆</span>
                            <span style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)' }} />
                        </div>

                        {/* Dialogue — dramatic, centered name, wider content */}
                        {DIALOGUE_BLOCKS.map((block, i) => (
                            <div key={`d${i}`} style={{ marginBottom: '36px', textAlign: 'center' }}>
                                <span style={{
                                    fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b',
                                    letterSpacing: '2px', textTransform: 'uppercase',
                                    display: 'inline-block', position: 'relative',
                                }}>
                                    {block.character}
                                    <span style={{
                                        position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
                                        width: '30px', height: '2px', background: 'rgba(245,158,11,0.3)',
                                    }} />
                                </span>
                                <p style={{
                                    fontSize: '1.1rem', lineHeight: 1.8, color: '#d4dae4',
                                    margin: '16px auto 0', maxWidth: '580px',
                                }}>
                                    {block.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area — compact and dramatic */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.04)', padding: '12px 24px 16px',
                    display: 'flex', justifyContent: 'center', background: 'rgba(8,12,22,0.95)',
                    backdropFilter: 'blur(12px)', position: 'relative', zIndex: 3,
                }}>
                    <div style={{ maxWidth: '650px', width: '100%' }}>
                        {/* Decisions — gold-accented moment of choice */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span style={{ width: '16px', height: '1px', background: 'rgba(245,158,11,0.3)' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f5d090', letterSpacing: '2px', textTransform: 'uppercase' }}>Your Move</span>
                            <span style={{ flex: 1, height: '1px', background: 'rgba(245,158,11,0.1)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                            {DECISIONS.map((d, i) => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoveredDecision(i)}
                                    onMouseLeave={() => setHoveredDecision(null)}
                                    style={{
                                        padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                                        background: hoveredDecision === i ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.015)',
                                        border: `1px solid ${hoveredDecision === i ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)'}`,
                                        borderRadius: '8px', transition: 'all 0.2s',
                                        boxShadow: hoveredDecision === i ? '0 0 20px rgba(245,158,11,0.05)' : 'none',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.82rem',
                                        color: hoveredDecision === i ? '#f5d090' : '#6b7280',
                                        lineHeight: 1.4,
                                    }}>
                                        {i + 1}. {d}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {['👀', '👂', '🔍', '🗣️'].map((emoji, i) => (
                                <button key={i} style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>{emoji}</button>
                            ))}
                            <input type="text" placeholder="Or type your own action..." style={{
                                flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                                color: '#e2e8f0', fontSize: '0.85rem', outline: 'none',
                            }} />
                            <button style={{
                                width: '36px', height: '36px', background: '#2563eb', border: 'none',
                                borderRadius: '8px', color: 'white', fontSize: '0.9rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>➤</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
