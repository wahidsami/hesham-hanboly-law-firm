import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { contentClient } from './contentClient';
import type { SiteContent } from '../types';

interface ContentContextValue {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextContent = await contentClient.getContent();
      setContent(nextContent);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const handleContentUpdate = () => {
      void refresh();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'site-content-updated') {
        void refresh();
      }
    };

    window.addEventListener('site-content-updated', handleContentUpdate as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('site-content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({ content, loading, error, refresh }),
    [content, loading, error],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a ContentProvider');
  }

  return context;
}
