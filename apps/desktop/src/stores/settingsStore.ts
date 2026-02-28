/**
 * Settings Store — Zustand state for user preferences.
 *
 * Manages theme, behavior toggles, delays, and persistence
 * through Tauri commands for JSON file storage.
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import i18n from '@/i18n';
import type { AppSettings } from '@/types';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'dark',
  auto_start: false,
  minimize_to_tray: false,
  show_notifications: true,
  auto_save: true,
  pre_action_delay_mins: 0,
  keep_screen_on: false,
  activity_logging: true,
  default_config: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface SettingsStore {
  settings: AppSettings;
  isLoaded: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetDefaults: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoaded: false,

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
    // Auto-save if enabled.
    if (get().settings.auto_save) {
      get()
        .saveSettings()
        .catch(() => {});
    }
  },

  loadSettings: async () => {
    try {
      const data = await invoke('get_settings');
      const loaded = { ...DEFAULT_SETTINGS, ...(data as AppSettings) };
      set({
        settings: loaded,
        isLoaded: true,
      });
      // Sync minimize_to_tray preference to backend AppState.
      try {
        await invoke('set_close_to_tray', { enabled: loaded.minimize_to_tray });
      } catch {
        // Silent fail — command may not be available in dev mode.
      }
      // Sync keep_screen_on preference to backend.
      try {
        await invoke('set_keep_screen_on', { enabled: loaded.keep_screen_on });
      } catch {
        // Silent fail.
      }
      // Sync language to i18n.
      if (loaded.language && loaded.language !== i18n.language) {
        i18n.changeLanguage(loaded.language);
      }
    } catch {
      // Use defaults if load fails (e.g., first run or dev mode).
      set({ settings: { ...DEFAULT_SETTINGS }, isLoaded: true });
    }
  },

  saveSettings: async () => {
    try {
      await invoke('save_settings', { settings: get().settings });
    } catch {
      // Silent fail in dev mode.
    }
  },

  resetDefaults: async () => {
    set({ settings: { ...DEFAULT_SETTINGS } });
    try {
      await invoke('reset_settings');
    } catch {
      // Silent fail.
    }
  },
}));
