'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import SidebarLeft from '@/components/SidebarLeft';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import ErrorToast from '@/components/ErrorToast';
import SettingsPanel from '@/components/SettingsPanel';
import { useAuth } from '@/lib/contexts';
import { useAutoSave } from '@/lib/useAutoSave';

export default function RoleplayPage() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useAutoSave();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Header />
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <SidebarLeft />

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          position: 'relative',
        }}>
          <ChatWindow />
          <ErrorToast />
          <ChatInput />
        </main>

        <SettingsPanel />
      </div>
    </div>
  );
}
