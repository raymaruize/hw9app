import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/theme';
import { useAppState } from '../state/AppStateContext';
import type { AppSettings } from '../types/models';

function Field({ label, value, onChangeText, secureTextEntry = false, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; secureTextEntry?: boolean; placeholder: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        style={styles.input}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export function SettingsScreen() {
  const { settings, updateSettings } = useAppState();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [message, setMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const save = async () => {
    await updateSettings(draft);
    setMessage('Settings saved locally.');
  };

  const testBackend = async () => {
    const base = draft.backend_base_url.trim().replace(/\/+$/, '');
    if (!base) {
      setMessage('Backend URL is empty.');
      return;
    }

    setTesting(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const response = await fetch(`${base}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        setMessage(`Backend test failed (${response.status}).`);
        return;
      }

      setMessage('Backend test succeeded. Ready to request recommendations.');
    } catch {
      setMessage('Backend test failed. Check URL/server and try again.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>API Settings</Text>
      <Text style={styles.subtitle}>Configure backend matching and optional AI provider. API key is stored securely and never logged.</Text>

      <Field
        label="Backend Base URL"
        value={draft.backend_base_url}
        onChangeText={(v) => setDraft((prev) => ({ ...prev, backend_base_url: v }))}
        placeholder="http://localhost:3000"
      />

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.label}>Enable AI Recommendation</Text>
          <Text style={styles.hint}>If AI fails, app falls back to backend then local matching.</Text>
        </View>
        <Switch
          value={draft.ai_provider.is_enabled}
          onValueChange={(v) => setDraft((prev) => ({ ...prev, ai_provider: { ...prev.ai_provider, is_enabled: v } }))}
        />
      </View>

      <Field
        label="AI Provider Name"
        value={draft.ai_provider.provider_name}
        onChangeText={(v) => setDraft((prev) => ({ ...prev, ai_provider: { ...prev.ai_provider, provider_name: v } }))}
        placeholder="OpenAI-compatible"
      />
      <Field
        label="AI Base URL"
        value={draft.ai_provider.base_url}
        onChangeText={(v) => setDraft((prev) => ({ ...prev, ai_provider: { ...prev.ai_provider, base_url: v } }))}
        placeholder="https://api.openai.com/v1"
      />
      <Field
        label="Model Name"
        value={draft.ai_provider.model_name}
        onChangeText={(v) => setDraft((prev) => ({ ...prev, ai_provider: { ...prev.ai_provider, model_name: v } }))}
        placeholder="gpt-4.1-mini / claude-like model"
      />
      <Field
        label="API Key"
        value={draft.ai_provider.api_key}
        onChangeText={(v) => setDraft((prev) => ({ ...prev, ai_provider: { ...prev.ai_provider, api_key: v } }))}
        placeholder="sk-..."
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryButton} onPress={save}>
        <Text style={styles.primaryButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={testBackend} disabled={testing}>
        <Text style={styles.secondaryButtonText}>{testing ? 'Testing…' : 'Test Backend Connection'}</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.info}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.inkSoft,
    marginBottom: 8,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    color: colors.ink,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    color: colors.ink,
  },
  switchRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    color: colors.inkSoft,
    maxWidth: 240,
    marginTop: 3,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: colors.accent,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  info: {
    color: colors.success,
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: '700',
  },
});