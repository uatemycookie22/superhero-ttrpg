'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
// import { WebSocketProvider } from '@/components/WebSocketProvider/WebSocketProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/* WebSocket disabled until server is implemented */}
      {children}
    </ThemeProvider>
  );
}