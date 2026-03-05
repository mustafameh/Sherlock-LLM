'use client';

import React, { useState } from 'react';

/*
 * OPTION 1: "Refined Current" — Polish the existing layout with better visual hierarchy.
 * 
 * KEEPS: Sidebar, header, narrator blocks, dialogue blocks with character names,
 *        scene navigation, decision buttons, quick actions, text input.
 * 
 * IMPROVES:
 * - Narrator blocks: Remove the box/card look. Let them breathe as flowing text
 *   with subtle left accent instead of full bordered cards.
 * - Dialogue: Differentiate NPC dialogue vs character dialogue more clearly.  
 *   Character name gets a colored dot indicator, not just colored text.
 * - Decisions: Cards with hover animations and subtle category hints instead of 
 *   plain full-width buttons.
 * - Scene nav: More compact, integrated into the header instead of floating in content.
 * - Quick actions: Redesigned as icon-only floating buttons to save space.
 * - Overall: Better whitespace, refined typography hierarchy, subtle mood gradients.
 */

const NARRATOR_BLOCKS = [
    'Bradstreet led us down a corridor to a heavy oak door. It was indeed locked, a stout key still in the mechanism on the inside. The Inspector produced a master key, unlocked it from the outside, and with a creak, the door swung open to reveal the scene within.',
    'The study was a library of chaos. Lord Blackwood lay sprawled on the Persian rug before his desk, one hand clutched at his chest. His face was a mask of shock. A fallen glass lay near his hand, a dark residue in its bowl. The room\'s single large window was shut fast against the storm, but a cold draft seemed to whisper from somewhere. Books were scattered, as if from a struggle, yet the door had been locked from within.',
];

const DIALOGUE_BLOCKS = [
    { character: 'Sherlock Holmes', content: '"Do not enter!" Holmes commanded, dropping to his knees at the threshold. His lens was out in an instant, scanning the floor, the keyhole, the edges of the door. "Observe, Watson. The key is in the lock. The tumblers are undisturbed. The window latch is secured. Yet, a man lies dead. How?"' },
];

const DECISIONS = [
    { text: 'Examine the body more closely for cause of death.', icon: '🔍' },
    { text: 'Inspect the contents of the glass and the dark residue.', icon: '🧪' },
    { text: 'Ask Inspector Bradstreet about the guests\' accounts of the evening.', icon: '🗣️' },
    { text: 'Search the room for any unusual object or disturbance.', icon: '👁️' },
];

export default function StoryDemo1() {
    const [hoveredDecision, setHoveredDecision] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0f1e', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
            {/* Sidebar */}
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

            {/* Main Content */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Scene navigation moved to header */}
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', padding: '4px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            Scene 3 of 3
                        </span>
                        <button style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>⚙</button>
                    </div>
                </header>

                {/* Demo badge */}
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Option 1: Refined Polish</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>— Better spacing, no card boxes on narration, scene nav in header</span>
                </div>

                {/* Story Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '760px', width: '100%' }}>
                        {/* Narrator — NO card, just clean flowing text with subtle left accent */}
                        {NARRATOR_BLOCKS.map((text, i) => (
                            <div key={`n${i}`} style={{
                                marginBottom: '24px', paddingLeft: '16px',
                                borderLeft: '2px solid rgba(245,158,11,0.15)',
                            }}>
                                <p style={{
                                    fontFamily: 'Georgia, "Playfair Display", serif',
                                    fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.8,
                                    color: '#a0a8b8', margin: 0,
                                }}>
                                    {text}
                                </p>
                            </div>
                        ))}

                        {/* Dialogue — Cleaner card with dot indicator */}
                        {DIALOGUE_BLOCKS.map((block, i) => (
                            <div key={`d${i}`} style={{
                                marginBottom: '24px', padding: '16px 20px',
                                background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b',
                                        letterSpacing: '1px', textTransform: 'uppercase',
                                    }}>{block.character}</span>
                                </div>
                                <p style={{
                                    fontSize: '0.95rem', lineHeight: 1.7, color: '#d1d5db', margin: 0,
                                }}>
                                    {block.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '760px', width: '100%' }}>
                        {/* Decisions — 2-column grid with hover effect */}
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>What will you do?</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            {DECISIONS.map((d, i) => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoveredDecision(i)}
                                    onMouseLeave={() => setHoveredDecision(null)}
                                    style={{
                                        padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                                        background: hoveredDecision === i ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${hoveredDecision === i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: '10px', transition: 'all 0.2s',
                                        transform: hoveredDecision === i ? 'translateY(-1px)' : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', marginRight: '8px' }}>{d.icon}</span>
                                    <span style={{ fontSize: '0.85rem', color: hoveredDecision === i ? '#c8d5e8' : '#8b95a5', lineHeight: 1.4 }}>{d.text}</span>
                                </button>
                            ))}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>or type your own response below</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {['👀', '👂', '🔍', '🗣️'].map((emoji, i) => (
                                <button key={i} style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                    fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>{emoji}</button>
                            ))}
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
