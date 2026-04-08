import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import type { AppSettings, SavedPoem } from '../types/models';

const SAVED_POEMS_KEY = 'saved_poems_v1';
const SETTINGS_KEY = 'app_settings_v1';
const AI_KEYCHAIN_SERVICE = 'poetry-companion-ai-provider';
const AI_KEYCHAIN_ACCOUNT = 'poetry-companion-api-key';

export const defaultSettings: AppSettings = {
  backend_base_url: 'http://localhost:3000',
  ai_provider: {
    provider_name: 'OpenAI-compatible',
    base_url: '',
    model_name: '',
    api_key: '',
    is_enabled: false,
  },
};

async function loadApiKeySecurely(): Promise<string> {
  try {
    const result = await Keychain.getGenericPassword({ service: AI_KEYCHAIN_SERVICE });
    if (!result) {
      return '';
    }
    if (result.username !== AI_KEYCHAIN_ACCOUNT) {
      return '';
    }
    return result.password ?? '';
  } catch {
    return '';
  }
}

async function saveApiKeySecurely(apiKey: string): Promise<void> {
  const normalized = apiKey.trim();
  try {
    if (!normalized) {
      await Keychain.resetGenericPassword({ service: AI_KEYCHAIN_SERVICE });
      return;
    }

    await Keychain.setGenericPassword(AI_KEYCHAIN_ACCOUNT, normalized, {
      service: AI_KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    // Keep app functional even if secure storage is unavailable.
  }
}

export async function loadSavedPoems(): Promise<SavedPoem[]> {
  const raw = await AsyncStorage.getItem(SAVED_POEMS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as SavedPoem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavedPoems(poems: SavedPoem[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_POEMS_KEY, JSON.stringify(poems));
}

export async function loadSettings(): Promise<AppSettings> {
  const [raw, secureApiKey] = await Promise.all([AsyncStorage.getItem(SETTINGS_KEY), loadApiKeySecurely()]);

  if (!raw) {
    return {
      ...defaultSettings,
    };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      backend_base_url: parsed.backend_base_url ?? defaultSettings.backend_base_url,
      ai_provider: {
        provider_name: parsed.ai_provider?.provider_name ?? defaultSettings.ai_provider.provider_name,
        base_url: parsed.ai_provider?.base_url ?? defaultSettings.ai_provider.base_url,
        model_name: parsed.ai_provider?.model_name ?? defaultSettings.ai_provider.model_name,
        api_key: secureApiKey,
        is_enabled: parsed.ai_provider?.is_enabled ?? defaultSettings.ai_provider.is_enabled,
      },
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const nonSensitiveSettings: AppSettings = {
    ...settings,
    ai_provider: {
      ...settings.ai_provider,
      api_key: '',
    },
  };

  await Promise.all([
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nonSensitiveSettings)),
    saveApiKeySecurely(settings.ai_provider.api_key),
  ]);
}