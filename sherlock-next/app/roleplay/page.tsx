'use client';

import React, { useEffect } from 'react';
import Header from '@/components/shared/Header';
import SidebarLeft from '@/components/roleplay/SidebarLeft';
import ChatWindow from '@/components/roleplay/ChatWindow';
import ChatInput from '@/components/roleplay/ChatInput';
import ErrorToast from '@/components/shared/ErrorToast';
import SettingsPanel from '@/components/roleplay/SettingsPanel';
import { useAuth } from '@/lib/client/contexts';
import { useAutoSave } from '@/lib/shared/useAutoSave';

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
