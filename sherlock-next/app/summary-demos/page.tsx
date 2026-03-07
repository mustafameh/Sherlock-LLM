import React from 'react';
import { ChevronDown, ScrollText, RefreshCw, Milestone, Fingerprint, Users, HelpCircle, CheckCircle2, BookOpen } from 'lucide-react';
import styles from './page.module.css';

// Dummy structured data mimicking the parsed LLM summary
const dummySummary = [
    { title: 'Current Situation', icon: Milestone, content: 'You are standing in Lord Blackwood\'s study. Rain lashes against the window. Inspector Lestrade is waiting for your analysis of the shattered vase.' },
    { title: 'Key Characters', icon: Users, content: '- Inspector Lestrade: Impatient, suspects the butler.\n- Lord Blackwood: Deceased, missing his signet ring.' },
    { title: 'Clues & Evidence', icon: Fingerprint, content: '- A shattered Ming vase with traces of white powder.\n- Muddy footprints leading towards the fireplace.' },
    { title: 'Major Decisions Made', icon: CheckCircle2, content: '- You chose to examine the study before interviewing the staff.\n- You withheld the discovery of the white powder from Lestrade.' },
    { title: 'Unresolved Questions', icon: HelpCircle, content: '- What was the white powder?\n- Where did the killer exit if the door was locked?' }
];

export default function SummaryDemosPage() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Hybrid "Story Thus Far" Proposals</h1>
                <p>Five new variations mixing the Glass Slide-Out (Opt 1) and the Cinematic Dossier (Opt 2).</p>
            </div>

            {/* HYBRID 1: The Glass Dossier Slide-out */}
            <div className={styles.demoSection}>
                <div className={styles.sectionHeader}>
                    <h2>Hybrid 1: The Glass Dossier Slide-out (Wide Panel)</h2>
                    <p>Uses a much wider slide-out panel but brings in the serif typography and structured 2-column dossier grid from Option 2. Best for widescreen storytelling without leaving the scene completely.</p>
                </div>
                <div className={styles.viewsContainer}>
                    <div className={styles.desktopView}>
                        <div className={styles.mockBackground}>
                            <div className={styles.h1PanelDesktop}>
                                <div className={styles.h1Header}>
                                    <ScrollText size={24} style={{ color: 'var(--color-amber-400)' }} />
                                    <h3>The Dossier</h3>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.h1Content}>
                                    <div className={styles.h1Grid}>
                                        <div className={styles.h1Column}>
                                            <div className={styles.opt2Section}>
                                                <h4><Milestone size={14} /> Current Situation</h4>
                                                <p>{dummySummary[0].content}</p>
                                            </div>
                                            <div className={styles.opt2Section}>
                                                <h4><CheckCircle2 size={14} /> Decisions Made</h4>
                                                <ul>
                                                    <li>Examined study first.</li>
                                                    <li>Withheld powder discovery.</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className={styles.opt2Divider}></div>
                                        <div className={styles.h1Column}>
                                            <div className={styles.opt2Section}>
                                                <h4><Fingerprint size={14} /> Clues & Evidence</h4>
                                                <ul>
                                                    <li>Shattered Ming vase.</li>
                                                    <li>Muddy footprints.</li>
                                                </ul>
                                            </div>
                                            <div className={styles.opt2Section}>
                                                <h4><HelpCircle size={14} /> Unresolved</h4>
                                                <ul>
                                                    <li>What is the powder?</li>
                                                    <li>Where is the killer?</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.opt1UpdateBtn} style={{ marginTop: 'var(--space-6)' }}>
                                        <RefreshCw size={16} /> Sync Latest Intel
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>PC View</div>
                    </div>
                    <div className={styles.mobileView}>
                        <div className={styles.mockBackgroundMobile}>
                            <div className={styles.h1PanelMobile}>
                                <div className={styles.h1HeaderMobile}>
                                    <h3>The Dossier</h3>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.opt2ContentMobile}>
                                    {dummySummary.map((sec, i) => (
                                        <div key={i} className={styles.opt2SectionMobile}>
                                            <h4><sec.icon size={14} /> {sec.title}</h4>
                                            <p>{sec.content.split('\n')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>Mobile View</div>
                    </div>
                </div>
            </div>

            {/* HYBRID 2: The Accordion Modal (Centered) */}
            <div className={styles.demoSection}>
                <div className={styles.sectionHeader}>
                    <h2>Hybrid 2: The Accordion Modal (Centered)</h2>
                    <p>Positions the UI as a commanding, centered glass modal (like Opt 2) but organizes the content using the interactive Accordions for better scanning of long text.</p>
                </div>
                <div className={styles.viewsContainer}>
                    <div className={styles.desktopView}>
                        <div className={styles.mockBackgroundCenter}>
                            <div className={styles.h2ModalDesktop}>
                                <div className={styles.opt2Header}>
                                    <ScrollText size={28} style={{ color: 'var(--color-amber-400)' }} />
                                    <h2>The Story Thus Far</h2>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.h2Content}>
                                    <div className={styles.h2AccordionList}>
                                        {dummySummary.map((sec, i) => (
                                            <details key={i} className={styles.opt1Accordion} open={i === 0}>
                                                <summary className={styles.opt1AccSummary}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                        <sec.icon size={18} className={styles.opt1Icon} />
                                                        {sec.title}
                                                    </div>
                                                    <ChevronDown size={18} className={styles.accChevron} />
                                                </summary>
                                                <div className={styles.opt1AccContent} style={{ fontSize: '1rem' }}>
                                                    {sec.content.split('\n').map((line, j) => (
                                                        <p key={j} style={{ margin: '0 0 8px 0' }}>{line}</p>
                                                    ))}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                    <div className={styles.opt2Footer} style={{ marginTop: 'auto' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Last updated 2 scenes ago</span>
                                        <button className={styles.opt1UpdateBtn} style={{ width: 'auto', marginTop: 0 }}> <RefreshCw size={16} /> Update Summary </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>PC View</div>
                    </div>
                    <div className={styles.mobileView}>
                        <div className={styles.mockBackgroundCenterMobile}>
                            <div className={styles.opt2ModalMobile}>
                                <div className={styles.opt2HeaderMobile}>
                                    <h2>Story Thus Far</h2>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.opt2ContentMobile}>
                                    {dummySummary.map((sec, i) => (
                                        <details key={i} className={styles.opt1Accordion} open={i === 0}>
                                            <summary className={styles.opt1AccSummary}>
                                                {sec.title}
                                                <ChevronDown size={16} className={styles.accChevron} />
                                            </summary>
                                            <div className={styles.opt1AccContent}>
                                                <p style={{ margin: 0 }}>{sec.content.split('\n')[0]}...</p>
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>Mobile View</div>
                    </div>
                </div>
            </div>

            {/* HYBRID 3: The Split-Screen Dossier */}
            <div className={styles.demoSection}>
                <div className={styles.sectionHeader}>
                    <h2>Hybrid 3: The Split-Screen Dossier</h2>
                    <p>Takes exactly 50% of the screen. Merges the slide-out mechanism with full-page dossier layout. Very dramatic and immersive for desktop.</p>
                </div>
                <div className={styles.viewsContainer}>
                    <div className={styles.desktopView}>
                        <div className={styles.mockBackgroundCenter}>
                            <div className={styles.h3SplitDesktop}>
                                <div className={styles.h3Header}>
                                    <h2>Case Notes</h2>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.h3Content}>
                                    {dummySummary.map((sec, i) => (
                                        <div key={i} className={styles.h3Section}>
                                            <h4 className={styles.h3SectionTitle}><sec.icon size={16} /> {sec.title}</h4>
                                            <div className={styles.h3SectionBody}>
                                                {sec.content.split('\n').map((line, j) => (
                                                    <p key={j} style={{ margin: '0 0 8px 0' }}>{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button className={styles.opt1UpdateBtn} style={{ marginTop: 'var(--space-4)' }}> Sync Intelligence </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>PC View</div>
                    </div>
                    <div className={styles.mobileView}>
                        <div className={styles.mockBackgroundCenterMobile}>
                            <div className={styles.h1PanelMobile}>
                                <div className={styles.h3HeaderMobile}>
                                    <h2>Case Notes</h2>
                                    <button className={styles.closeBtnAbs}>✕</button>
                                </div>
                                <div className={styles.opt2ContentMobile}>
                                    {dummySummary.map((sec, i) => (
                                        <div key={i} className={styles.h3SectionMobile}>
                                            <h4 className={styles.h3SectionTitle}><sec.icon size={14} /> {sec.title}</h4>
                                            <p className={styles.h3SectionBody}>{sec.content.split('\n')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>Mobile View (Functions like standard overlay)</div>
                    </div>
                </div>
            </div>

            {/* HYBRID 4: The Book Layout (Centered, 2 Columns) */}
            <div className={styles.demoSection}>
                <div className={styles.sectionHeader}>
                    <h2>Hybrid 4: The Open Book Layout</h2>
                    <p>A centered modal that visually separates content into an open 2-page spread. Elegant typography, glassmorphism pages. Extremely thematic for a detective journal.</p>
                </div>
                <div className={styles.viewsContainer}>
                    <div className={styles.desktopView}>
                        <div className={styles.mockBackgroundCenter}>
                            <div className={styles.h4BookModal}>
                                <div className={styles.h4BookSpine}></div>
                                <button className={styles.closeBtnAbs} style={{ zIndex: 10, right: 'var(--space-6)', top: 'var(--space-6)' }}>✕</button>

                                <div className={styles.h4Page}>
                                    <div className={styles.h4PageHeader}>
                                        <BookOpen size={20} className={styles.opt1Icon} />
                                        <h3>The Investigation</h3>
                                    </div>
                                    <div className={styles.opt2Section}>
                                        <h4><Milestone size={14} /> Current Situation</h4>
                                        <p>{dummySummary[0].content}</p>
                                    </div>
                                    <div className={styles.opt2Section}>
                                        <h4><Users size={14} /> Key Characters</h4>
                                        <ul style={{ marginTop: 0, paddingTop: 0 }}>
                                            <li>Inspector Lestrade (Impatient)</li>
                                            <li>Lord Blackwood (Deceased)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.h4Page}>
                                    <div className={styles.opt2Section} style={{ marginTop: 'var(--space-10)' }}>
                                        <h4><Fingerprint size={14} /> Clues & Evidence</h4>
                                        <ul style={{ marginTop: 0, paddingTop: 0 }}>
                                            <li>Shattered Ming vase.</li>
                                            <li>Muddy footprints.</li>
                                        </ul>
                                    </div>
                                    <div className={styles.opt2Section}>
                                        <h4><HelpCircle size={14} /> Unresolved</h4>
                                        <ul style={{ marginTop: 0, paddingTop: 0 }}>
                                            <li>What is the powder?</li>
                                            <li>Where is the killer?</li>
                                        </ul>
                                    </div>

                                    <div className={styles.opt2Footer} style={{ marginTop: 'auto', borderTop: 'none', justifyContent: 'flex-end' }}>
                                        <button className={styles.opt1UpdateBtn} style={{ width: 'auto', marginTop: 0 }}> <RefreshCw size={16} /> Turn Page (Update) </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>PC View</div>
                    </div>
                    <div className={styles.mobileView}>
                        <div className={styles.mockBackgroundCenterMobile}>
                            <div className={styles.h4BookModalMobile}>
                                <div className={styles.h4PageHeader} style={{ padding: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <BookOpen size={20} className={styles.opt1Icon} />
                                    <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-inverse)' }}>The Investigation</h3>
                                    <button className={styles.closeBtnAbs} style={{ top: 'var(--space-4)' }}>✕</button>
                                </div>
                                <div className={styles.opt2ContentMobile}>
                                    {dummySummary.map((sec, i) => (
                                        <div key={i} className={styles.opt2SectionMobile}>
                                            <h4 style={{ color: 'var(--color-amber-400)', margin: '0 0 var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '1rem', paddingBottom: '4px' }}>{sec.title}</h4>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{sec.content.split('\n')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>Mobile View (Single Page)</div>
                    </div>
                </div>
            </div>

            {/* HYBRID 5: The Tabbed Glass Panel */}
            <div className={styles.demoSection}>
                <div className={styles.sectionHeader}>
                    <h2>Hybrid 5: The Tabbed Glass Panel</h2>
                    <p>Uses the standard Slide-out side panel but removes accordions entirely in favor of elegant Dossier-style tabs at the top. Ultra-clean without scrolling long walls of text.</p>
                </div>
                <div className={styles.viewsContainer}>
                    <div className={styles.desktopView}>
                        <div className={styles.mockBackground}>
                            <div className={styles.opt1PanelDesktop}>
                                <div className={styles.opt1Header}>
                                    <div>
                                        <h3>The Story Thus Far</h3>
                                    </div>
                                    <button className={styles.closeBtn}>✕</button>
                                </div>
                                {/* Elegant Tabs */}
                                <div className={styles.h5Tabs}>
                                    <div className={`${styles.h5Tab} ${styles.h5TabActive}`}>Situation</div>
                                    <div className={styles.h5Tab}>Clues</div>
                                    <div className={styles.h5Tab}>Decisions</div>
                                </div>
                                <div className={styles.h5Content}>
                                    <div className={styles.opt2Section} style={{ borderBottom: 'none' }}>
                                        <h4><Milestone size={18} /> Current Situation</h4>
                                        <p style={{ fontSize: '1.05rem' }}>{dummySummary[0].content}</p>

                                        <h4 style={{ marginTop: 'var(--space-6)' }}><Users size={18} /> Key Characters</h4>
                                        <ul style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                                            <li>Inspector Lestrade</li>
                                            <li>Lord Blackwood</li>
                                        </ul>
                                    </div>

                                    <button className={styles.opt1UpdateBtn} style={{ marginTop: 'auto' }}>
                                        <RefreshCw size={16} /> Update Summary
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>PC View</div>
                    </div>
                    <div className={styles.mobileView}>
                        <div className={styles.mockBackgroundMobile}>
                            <div className={styles.opt1PanelMobile}>
                                <div className={styles.opt1Header}>
                                    <h3 style={{ fontSize: '1.2rem' }}>Story Thus Far</h3>
                                    <button className={styles.closeBtn}>✕</button>
                                </div>
                                <div className={styles.h5Tabs}>
                                    <div className={`${styles.h5Tab} ${styles.h5TabActive}`}>Status</div>
                                    <div className={styles.h5Tab}>Clues</div>
                                    <div className={styles.h5Tab}>Decisions</div>
                                </div>
                                <div className={styles.h5Content}>
                                    <div className={styles.opt2SectionMobile} style={{ borderBottom: 'none' }}>
                                        <h4 style={{ fontSize: '1.1rem', color: 'var(--color-amber-400)', marginBottom: '8px' }}><Milestone size={16} /> Situation</h4>
                                        <p style={{ color: 'var(--text-secondary)' }}>{dummySummary[0].content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.viewLabel}>Mobile View</div>
                    </div>
                </div>
            </div>

        </div>
    );
}
