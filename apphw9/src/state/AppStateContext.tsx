import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { defaultSettings, loadSavedPoems, loadSettings, saveSavedPoems, saveSettings } from '../storage';
import type { AppSettings, ContextProfile, MatchResult, SavedPoem } from '../types/models';

type AppStateValue = {
  savedPoems: SavedPoem[];
  settings: AppSettings;
  isHydrating: boolean;
  savePoem: (result: MatchResult, context: ContextProfile) => Promise<void>;
  deletePoem: (id: string) => Promise<void>;
  updateSettings: (next: AppSettings) => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [loadedPoems, loadedSettings] = await Promise.all([loadSavedPoems(), loadSettings()]);
        setSavedPoems(loadedPoems);
        setSettings(loadedSettings);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      savedPoems,
      settings,
      isHydrating,
      savePoem: async (result, context) => {
        const duplicate = savedPoems.some(
          (item) => item.line_text === result.line_text && item.title === result.title && item.author === result.author,
        );
        if (duplicate) {
          return;
        }

        const poem: SavedPoem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          line_text: result.line_text,
          title: result.title,
          author: result.author,
          dynasty: result.dynasty,
          short_reason: result.match_reason,
          saved_at: new Date().toISOString(),
          context_snapshot: context,
        };

        const next = [poem, ...savedPoems];
        setSavedPoems(next);
        await saveSavedPoems(next);
      },
      deletePoem: async (id) => {
        const next = savedPoems.filter((item) => item.id !== id);
        setSavedPoems(next);
        await saveSavedPoems(next);
      },
      updateSettings: async (next) => {
        setSettings(next);
        await saveSettings(next);
      },
    }),
    [isHydrating, savedPoems, settings],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used inside AppStateProvider.');
  }
  return value;
}