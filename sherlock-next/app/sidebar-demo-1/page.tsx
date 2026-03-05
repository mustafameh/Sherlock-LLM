'use client';

import React from 'react';
import styles from './page.module.css';
import { PenSquare, PanelLeftClose, PanelLeft, MoreHorizontal, Settings, MessageSquare } from 'lucide-react';

const MOCK_STORIES = [
    { id: '1', title: 'The Blackmail Letters', character: 'Dr. Watson', date: 'Today' },
    { id: '2', title: 'A Murder at the Manor', character: 'Inspector Lestrade', date: 'Yesterday' },
    { id: '3', title: 'The Clockmaker\'s Last Breath', character: 'A Stranger', date: 'Previous 7 Days' },
];

export default function SidebarDemo1() {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.background} />

            {/* Sidebar Overlay */}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.header}>
                    {!collapsed && <h2 className={styles.logo}>Sherlock</h2>}
                    <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                <div className={styles.content}>
                    <button className={styles.newStoryBtn}>
                        <PenSquare size={18} />
                        {!collapsed && <span>New Story</span>}
                    </button>

                    <div className={styles.section}>
                        {!collapsed && <div className={styles.sectionLabel}>Recent Chats</div>}
                        <div className={styles.storyList}>
                            {MOCK_STORIES.map((story, i) => (
                                <div key={story.id} className={`${styles.storyItem} ${i === 0 ? styles.active : ''}`}>
                                    <MessageSquare size={16} className={styles.storyIcon} />
                                    {!collapsed && (
                                        <div className={styles.storyDetails}>
                                            <div className={styles.storyTitle}>{story.title}</div>
                                            <div className={styles.storyMeta}>{story.character}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>N</div>
                        {!collapsed && <span className={styles.userName}>Robo XYZ</span>}
                        {!collapsed && <Settings size={18} className={styles.settingsIcon} />}
                    </div>
                </div>
            </aside>

            {/* Mock Main Content Area */}
            <main className={`${styles.mainContent} ${collapsed ? styles.mainExpanded : ''}`}>
                <div className={styles.mockChat}>
                    <h1>Option 1: Glassmorphism Slide-over</h1>
                    <p>A sleek, translucent sidebar that blends smoothly into the background.</p>
                </div>
            </main>
        </div>
    );
}
