'use client';

import React from 'react';
import styles from './page.module.css';
import { Plus, PanelLeftClose, PanelLeft, MessageSquare, Settings, Search, Clock } from 'lucide-react';

const MOCK_GROUPS = [
    {
        label: 'Today',
        stories: [
            { id: '1', title: 'The Blackmail Letters' },
            { id: '2', title: 'A Murder at the Manor' },
        ]
    },
    {
        label: 'Previous 7 Days',
        stories: [
            { id: '3', title: 'The Clockmaker\'s Last Breath' },
            { id: '4', title: 'Surprise Me - The Nun' },
        ]
    }
];

export default function SidebarDemo2() {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.header}>
                    {!collapsed && (
                        <div className={styles.userDropdown}>
                            <div className={styles.avatar}>N</div>
                            <span className={styles.userName}>Robo XYZ</span>
                            <Settings size={16} className={styles.settingsIcon} />
                        </div>
                    )}
                    <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                {!collapsed && (
                    <div className={styles.searchBar}>
                        <Search size={16} className={styles.searchIcon} />
                        <input type="text" placeholder="Search stories..." className={styles.searchInput} />
                    </div>
                )}

                <div className={styles.content}>
                    <button className={`${styles.newStoryBtn} ${collapsed ? styles.btnCollapsed : ''}`}>
                        <Plus size={18} />
                        {!collapsed && <span>New Story</span>}
                    </button>

                    {!collapsed && (
                        <div className={styles.storyGroups}>
                            {MOCK_GROUPS.map((group, i) => (
                                <div key={i} className={styles.group}>
                                    <div className={styles.groupLabel}>{group.label}</div>
                                    <div className={styles.groupList}>
                                        {group.stories.map((story, j) => (
                                            <div key={story.id} className={`${styles.storyItem} ${i === 0 && j === 0 ? styles.active : ''}`}>
                                                <MessageSquare size={16} className={styles.storyIcon} />
                                                <span className={styles.storyTitle}>{story.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {collapsed && (
                        <div className={styles.collapsedIcons}>
                            <div className={`${styles.iconItem} ${styles.active}`}><Clock size={20} /></div>
                            <div className={styles.iconItem}><Settings size={20} /></div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mock Main Content Area */}
            <main className={`${styles.mainContent} ${collapsed ? styles.mainExpanded : ''}`}>
                <div className={styles.mockChat}>
                    <h1>Option 2: Classic Minimalist Solid</h1>
                    <p>A highly structured, Notion-style solid dark sidebar optimized for organization and quick scanning.</p>
                </div>
            </main>
        </div>
    );
}
