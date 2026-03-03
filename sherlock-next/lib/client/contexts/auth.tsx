'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    user: { id: string; username: string; email: string; displayName: string; avatar: string } | null;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateProfile: (displayName: string, avatar: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ id: string; username: string; email: string; displayName: string; avatar: string } | null>(null);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            if (data.logged_in) {
                setUser({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    displayName: data.displayName || data.username,
                    avatar: data.avatar || 'detective',
                });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => { checkAuth(); }, [checkAuth]);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                await checkAuth();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [checkAuth]);

    const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (data.success) {
                await checkAuth();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [checkAuth]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout');
            setUser(null);
        } catch {
            // ignore
        }
    }, []);

    const updateProfile = useCallback(async (displayName: string, avatar: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, avatar }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(prev => prev ? { ...prev, displayName: data.displayName, avatar: data.avatar } : null);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isLoggedIn: !!user, login, register, logout, checkAuth, updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
