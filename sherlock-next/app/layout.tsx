import type { Metadata } from "next";
import "./globals.css";
import { ChatProvider, SettingsProvider, AuthProvider } from '@/lib/contexts';

export const metadata: Metadata = {
  title: "Sherlock Holmes AI — ReAct Chatbot",
  description: "An AI chatbot embodying Sherlock Holmes with ReAct reasoning capabilities and tool use. Built as a Master's dissertation project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SettingsProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
