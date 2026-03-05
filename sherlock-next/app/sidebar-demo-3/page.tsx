'use client';

import React from 'react';
import styles from './page.module.css';
import { Menu, X, Plus, MessageSquare, History, Settings } from 'lucide-react';

const MOCK_STORIES = [
    { id: '1', title: 'The Blackmail Letters' },
    { id: '2', title: 'A Murder at the Manor' },
    { id: '3', title: 'The Clockmaker\'s Last Breath' },
    { id: '4', title: 'Surprise Me - The Nun' },
];

export default function SidebarDemo3() {
    const [open, setOpen] = React.useState(true);

    return (
        <div className={styles.container}>
            <div className={styles.background} />

            {/* Floating Sidebar Island */}
            <div className={`${styles.floatingIsland} ${open ? styles.open : styles.closed}`}>
                {open ? (
                    <div className={styles.panelContent}>
                        <div className={styles.header}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>N</div>
                                <span className={styles.userName}>Robo XYZ</span>
                            </div>
                            <button className={styles.iconBtn} onClick={() => setOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.scrollArea}>
                            <button className={styles.newStoryBtn}>
                                <Plus size={18} />
                                Start Investigation
                            </button>

                            <div className={styles.sectionTitle}>
                                <History size={14} />
                                <span>Recent Cases</span>
                            </div>

                            <div className={styles.storyList}>
                                {MOCK_STORIES.map((story, i) => (
                                    <div key={story.id} className={`${styles.storyItem} ${i === 0 ? styles.active : ''}`}>
                                        <MessageSquare size={16} className={styles.storyIcon} />
                                        <div className={styles.storyTitle}>{story.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button className={styles.footerBtn}>
                                <Settings size={16} />
                                Settings
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className={styles.fabBtn} onClick={() => setOpen(true)}>
                        <Menu size={24} />
                    </button>
                )}
            </div>

            {/* Mock Main Content Area */}
            <main className={styles.mainContent}>
                <div className={styles.mockChat}>
                    <h1>Option 3: Floating Island</h1>
                    <p>A highly modern floating card that completely detaches from the screen edge and collapses into a single button to maximize story immersion.</p>
                </div>
            </main>
        </div>
    );
}
