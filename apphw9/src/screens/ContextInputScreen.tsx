import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/theme';
import { deriveDefaultTemporalContext } from '../services/dateContext';
import { resolveCurrentLocation } from '../services/location';
import { getRecommendation } from '../services/recommendation';
import { getCurrentWeatherSummary } from '../services/weather';
import { useAppState } from '../state/AppStateContext';
import type { ContextProfile } from '../types/models';
import type { InputStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<InputStackParamList, 'ContextInput'>;

const defaults = deriveDefaultTemporalContext();

const initialForm: ContextProfile = {
  emotion_text: '',
  city_or_location: '',
  environment_style: '',
  weather: '',
  season: defaults.season,
  time_of_day: defaults.time_of_day,
  date_context: defaults.date_context,
  lunar_date_or_festival: defaults.lunar_date_or_festival,
};

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        style={styles.input}
      />
    </View>
  );
}

export function ContextInputScreen({ navigation }: Props) {
  const { settings } = useAppState();
  const [form, setForm] = useState<ContextProfile>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const setField = (key: keyof ContextProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.emotion_text.trim()) return 'Please enter emotion.';
    if (!form.city_or_location.trim()) return 'Please enter location.';
    if (!form.environment_style.trim()) return 'Please enter environment style.';
    if (!form.weather.trim()) return 'Please enter weather.';
    if (!form.season.trim()) return 'Please enter season.';
    if (!form.time_of_day.trim()) return 'Please enter time of day.';
    return null;
  };

  const onUseLocation = async () => {
    setLocationMessage(null);
    const result = await resolveCurrentLocation();
    if (result.status === 'granted' && result.cityOrLocation) {
      const detected = result.cityOrLocation;
      const weatherText =
        typeof result.latitude === 'number' && typeof result.longitude === 'number'
          ? await getCurrentWeatherSummary(result.latitude, result.longitude)
          : undefined;

      setForm((prev) => ({
        ...prev,
        city_or_location: detected,
        weather: weatherText ?? prev.weather,
      }));

      setLocationMessage(
        weatherText
          ? `Detected location: ${result.cityOrLocation}. Weather updated to “${weatherText}”.`
          : result.message ?? `Detected location: ${result.cityOrLocation}`,
      );
      return;
    }
    setLocationMessage(result.message ?? 'Location unavailable. Please input manually.');
  };

  const onRecommend = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const recommendation = await getRecommendation(form, settings);
      navigation.navigate('MatchResult', {
        result: recommendation.match,
        context: form,
        source: recommendation.source,
        warning: recommendation.warning,
      });
    } catch (error) {
      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError('Unable to recommend a poem now. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Poetry Companion</Text>
      <Text style={styles.subtitle}>Enter your full context for one precise recommendation.</Text>

      <Field label="Emotion" value={form.emotion_text} onChangeText={(v) => setField('emotion_text', v)} placeholder="e.g. thoughtful, homesick, peaceful" />
      <Field label="Location" value={form.city_or_location} onChangeText={(v) => setField('city_or_location', v)} placeholder="e.g. Shanghai / Vancouver" />

      <TouchableOpacity style={styles.secondaryButton} onPress={onUseLocation}>
        <Text style={styles.secondaryButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      {locationMessage ? <Text style={styles.infoText}>{locationMessage}</Text> : null}

      <Field label="Environment" value={form.environment_style} onChangeText={(v) => setField('environment_style', v)} placeholder="e.g. riverside, mountain trail, city night" />
      <Field label="Weather" value={form.weather} onChangeText={(v) => setField('weather', v)} placeholder="e.g. rainy, clear, snowy" />
      <Field label="Season" value={form.season} onChangeText={(v) => setField('season', v)} placeholder="spring/summer/autumn/winter" />
      <Field label="Time of Day" value={form.time_of_day} onChangeText={(v) => setField('time_of_day', v)} placeholder="morning/afternoon/night" />
      <Field label="Date Context (optional)" value={form.date_context ?? ''} onChangeText={(v) => setField('date_context', v)} placeholder="e.g. weekend, anniversary" />
      <Field
        label="Lunar/Festival (optional)"
        value={form.lunar_date_or_festival ?? ''}
        onChangeText={(v) => setField('lunar_date_or_festival', v)}
        placeholder="e.g. Mid-Autumn, Lantern Festival"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} disabled={loading} onPress={onRecommend}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Recommend One Poem</Text>}
      </TouchableOpacity>
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
    paddingBottom: 36,
    gap: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.inkSoft,
    marginBottom: 10,
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
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    marginTop: 6,
  },
  infoText: {
    color: colors.inkSoft,
  },
});