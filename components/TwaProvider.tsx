'use client';

import { useEffect, useState } from 'react';

interface TwaProviderProps {
  children: React.ReactNode;
}

export function TwaProvider({ children }: TwaProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize Telegram WebApp and authenticate
    const initTwa = async () => {
      try {
        // Dynamic import for @twa-dev/sdk
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Initialize the WebApp
        WebApp.ready();
        
        // Get initData for authentication
        const initData = WebApp.initData;
        
        if (initData) {
          // Send initData to server for authentication
          const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          });
          
          if (response.ok) {
            console.log('Authenticated via Telegram');
            // Reload to get authenticated session
            window.location.reload();
          }
        }
        
        // Expand to fullscreen
        WebApp.expand();
        
        // Apply theme
        const themeParams = WebApp.themeParams;
        if (themeParams) {
          document.documentElement.style.setProperty('--bg-color', themeParams.bg_color || '#0f172a');
          document.documentElement.style.setProperty('--text-color', themeParams.text_color || '#f1f5f9');
          document.documentElement.style.setProperty('--hint-color', themeParams.hint_color || '#94a3b8');
          document.documentElement.style.setProperty('--link-color', themeParams.link_color || '#fbbf24');
          document.documentElement.style.setProperty('--button-color', themeParams.button_color || '#f59e0b');
          document.documentElement.style.setProperty('--button-text-color', themeParams.button_text_color || '#0f172a');
        }
        
        console.log('Telegram WebApp initialized');
      } catch (error) {
        console.log('Not running in Telegram:', error);
      }
    };

    initTwa();
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
