'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts';
import { AVATAR_OPTIONS } from '@/lib/types';
import EditProfileModal from './EditProfileModal';
import styles from './Header.module.css';

export default function Header() {
    const { user, isLoggedIn, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userAvatarSrc = AVATAR_OPTIONS.find(a => a.id === user?.avatar)?.src || '/avatars/detective.svg';

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>
                        <Image src="/logo.png" alt="Sherlock Holmes Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1 className={styles.title}>
                        Agent Sherlock
                    </h1>
                </div>

                <div className={styles.headerRight}>
                    {isLoggedIn ? (
                        <div className={styles.userMenu} ref={dropdownRef}>
                            <button
                                className={styles.userBtn}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className={styles.userIcon}>
                                    <Image src={userAvatarSrc} alt="Avatar" width={32} height={32} style={{ borderRadius: '50%' }} />
                                </div>
                                {user?.displayName || user?.username}
                                <span className={`${styles.caret} ${dropdownOpen ? styles.caretOpen : ''}`}>
                                    ▾
                                </span>
                            </button>
                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownAvatar}>
                                            <Image src={userAvatarSrc} alt="Avatar" width={36} height={36} style={{ borderRadius: '50%' }} />
                                        </div>
                                        <div>
                                            <div className={styles.dropdownName}>{user?.displayName || user?.username}</div>
                                            <div className={styles.dropdownEmail}>{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                                    >
                                        👤 Profile Info
                                    </button>
                                    <button
                                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                        onClick={() => { logout(); setDropdownOpen(false); }}
                                    >
                                        ↪ Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            → Login
                        </Link>
                    )}
                </div>
            </header>

            {showProfileModal && (
                <EditProfileModal onClose={() => setShowProfileModal(false)} />
            )}
        </>
    );
}
