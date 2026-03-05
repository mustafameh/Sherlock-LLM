'use client';

import React, { useState } from 'react';

/*
 * OPTION 2: "Immersive Reading Mode" — Focus on the story text experience.
 * 
 * KEEPS: Sidebar, header, story window, decisions, quick actions, text input.
 * 
 * IMPROVES:
 * - Narrator text is much larger and more prominent — this IS the story.
 * - Dialogue gets a distinct visual treatment: colored left border + 
 *   character avatar circle next to name.
 * - More vertical space between blocks for breathing room.
 * - Decisions are full-width with a left color accent bar per choice.
 * - A mood/atmosphere gradient subtly tints the background.
 * - Scene nav is more elegant — a progress bar instead of "Scene X of Y".
 * - The input area is cleaner with decision cards having more visual weight.
 */

const NARRATOR_BLOCKS = [
    'Bradstreet led us down a corridor to a heavy oak door. It was indeed locked, a stout key still in the mechanism on the inside. The Inspector produced a master key, unlocked it from the outside, and with a creak, the door swung open to reveal the scene within.',
    'The study was a library of chaos. Lord Blackwood lay sprawled on the Persian rug before his desk, one hand clutched at his chest. His face was a mask of shock. A fallen glass lay near his hand, a dark residue in its bowl. The room\'s single large window was shut fast against the storm, but a cold draft seemed to whisper from somewhere. Books were scattered, as if from a struggle, yet the door had been locked from within.',
];

const DIALOGUE_BLOCKS = [
    { character: 'Sherlock Holmes', color: '#f59e0b', initial: 'SH', content: '"Do not enter!" Holmes commanded, dropping to his knees at the threshold. His lens was out in an instant, scanning the floor, the keyhole, the edges of the door. "Observe, Watson. The key is in the lock. The tumblers are undisturbed. The window latch is secured. Yet, a man lies dead. How?"' },
];

const DECISIONS = [
    'Examine the body more closely for cause of death.',
    'Inspect the contents of the glass and the dark residue.',
    'Ask Inspector Bradstreet about the guests\' accounts of the evening.',
    'Search the room for any unusual object or disturbance.',
];

const DECISION_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function StoryDemo2() {
    const [hoveredDecision, setHoveredDecision] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0f1e', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
            {/* Sidebar — same structure */}
            {sidebarOpen && (
                <aside style={{
                    width: '220px', background: '#0d1321', borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔍</span>
                            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>Agent Sherlock</span>
                        </div>
                        <button style={{
                            width: '100%', padding: '10px', background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px',
                            color: '#f5d090', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
                        }}>
                            + New Story
                        </button>
                    </div>
                    <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Story History</span>
                        {['A Murder at the Manor', 'The Clockwork Corpse', 'The Blackmail Letters'].map((title, i) => (
                            <div key={i} style={{
                                padding: '10px 8px', marginTop: '4px', borderRadius: '6px', cursor: 'pointer',
                                background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                                borderLeft: i === 0 ? '2px solid #f59e0b' : '2px solid transparent',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#c8cdd5', fontWeight: i === 0 ? 600 : 400 }}>{title}</p>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Dr. Watson</span>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(13,19,33,0.8)', backdropFilter: 'blur(12px)', minHeight: '48px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', cursor: 'pointer' }}>☰</button>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>← Home</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>A Murder at the Manor</span>
                        <span style={{ color: '#60a5fa', fontSize: '0.8rem' }}>Playing as Dr. Watson</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Progress bar scene indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{
                                    width: s === 3 ? '32px' : '20px', height: '3px', borderRadius: '2px',
                                    background: s <= 3 ? (s === 3 ? '#f59e0b' : 'rgba(245,158,11,0.3)') : 'rgba(255,255,255,0.08)',
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>3/3</span>
                        </div>
                        <button style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>⚙</button>
                    </div>
                </header>

                {/* Demo badge */}
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>Option 2: Immersive Reading</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>— Larger text, character avatars, mood gradient, progress bar nav</span>
                </div>

                {/* Story Content — with mood gradient */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '40px 32px', display: 'flex', justifyContent: 'center',
                    background: 'linear-gradient(180deg, rgba(127,29,29,0.04) 0%, transparent 40%, rgba(88,28,135,0.03) 100%)',
                }}>
                    <div style={{ maxWidth: '700px', width: '100%' }}>
                        {/* Narrator — Large, prominent, the star of the show */}
                        {NARRATOR_BLOCKS.map((text, i) => (
                            <p key={`n${i}`} style={{
                                fontFamily: 'Georgia, "Playfair Display", serif',
                                fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.9,
                                color: '#b0b8c8', margin: '0 0 32px 0',
                            }}>
                                {text}
                            </p>
                        ))}

                        {/* Dialogue — Character avatar circle + colored border */}
                        {DIALOGUE_BLOCKS.map((block, i) => (
                            <div key={`d${i}`} style={{
                                marginBottom: '32px', display: 'flex', gap: '16px',
                            }}>
                                {/* Character avatar */}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    background: `${block.color}20`, border: `2px solid ${block.color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 700, color: block.color, marginTop: '2px',
                                }}>
                                    {block.initial}
                                </div>
                                <div style={{
                                    flex: 1, padding: '16px 20px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '0 12px 12px 12px',
                                    borderLeft: `3px solid ${block.color}40`,
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: 700, color: block.color,
                                        letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px',
                                    }}>{block.character}</span>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#d1d5db', margin: 0 }}>
                                        {block.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '700px', width: '100%' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>What will you do?</span>
                        {/* Decisions with left color accent */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            {DECISIONS.map((d, i) => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoveredDecision(i)}
                                    onMouseLeave={() => setHoveredDecision(null)}
                                    style={{
                                        padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                                        background: hoveredDecision === i ? `${DECISION_COLORS[i]}08` : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${hoveredDecision === i ? `${DECISION_COLORS[i]}30` : 'rgba(255,255,255,0.05)'}`,
                                        borderLeft: `3px solid ${hoveredDecision === i ? DECISION_COLORS[i] : `${DECISION_COLORS[i]}30`}`,
                                        borderRadius: '0 8px 8px 0', transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{ fontSize: '0.9rem', color: hoveredDecision === i ? '#e2e8f0' : '#8b95a5' }}>
                                        {i + 1}. {d}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>or type your own response below</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[{ icon: '👀', label: 'Look' }, { icon: '👂', label: 'Listen' }, { icon: '🔍', label: 'Examine' }, { icon: '🗣️', label: 'Ask' }].map((qa, i) => (
                                    <button key={i} style={{
                                        padding: '6px 10px', borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                                    }}>{qa.icon} {qa.label}</button>
                                ))}
                            </div>
                            <input type="text" placeholder="Or type what Dr. Watson does instead..." style={{
                                flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
                            }} />
                            <button style={{
                                width: '40px', height: '40px', background: '#2563eb', border: 'none',
                                borderRadius: '10px', color: 'white', fontSize: '1rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>➤</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
