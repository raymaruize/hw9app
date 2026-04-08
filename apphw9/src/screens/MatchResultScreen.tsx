import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/theme';
import { useAppState } from '../state/AppStateContext';
import type { InputStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<InputStackParamList, 'MatchResult'>;

export function MatchResultScreen({ navigation, route }: Props) {
  const { result, context, source, warning } = route.params;
  const { savePoem, savedPoems } = useAppState();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isSaved = useMemo(
    () => savedPoems.some((item) => item.line_text === result.line_text && item.title === result.title && item.author === result.author),
    [result.author, result.line_text, result.title, savedPoems],
  );

  const onSave = async () => {
    await savePoem(result, context);
    setSaveMessage(isSaved ? 'Already saved.' : 'Saved successfully.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}
      <Text style={styles.source}>Source: {source}</Text>

      <View style={styles.card}>
        <Text style={styles.lineText}>“{result.line_text}”</Text>
        <Text style={styles.meta}>{result.title}</Text>
        <Text style={styles.meta}>
          {result.author} · {result.dynasty}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Reason</Text>
        <Text style={styles.bodyText}>{result.match_reason}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modern Explanation</Text>
        <Text style={styles.bodyText}>{result.modern_explanation}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidence / Popularity</Text>
        <Text style={styles.bodyText}>
          {Math.round(result.confidence * 100)}% / {Math.round(result.popularity_score * 100)}%
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternatives</Text>
        {result.alternatives.length === 0 ? (
          <Text style={styles.bodyText}>No alternatives returned.</Text>
        ) : (
          result.alternatives.slice(0, 2).map((alt, idx) => (
            <Text key={`${alt}-${idx}`} style={styles.altText}>
              {idx + 1}. {alt}
            </Text>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>{isSaved ? 'Already Saved' : 'Save This Poem'}</Text>
      </TouchableOpacity>

      {saveMessage ? <Text style={styles.success}>{saveMessage}</Text> : null}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.getParent()?.navigate('Saved Poems')}>
        <Text style={styles.secondaryButtonText}>Go to Saved Poems</Text>
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
    paddingBottom: 24,
    gap: 12,
  },
  warning: {
    backgroundColor: colors.accentSoft,
    color: colors.ink,
    padding: 10,
    borderRadius: 8,
  },
  source: {
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  lineText: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: '700',
  },
  meta: {
    color: colors.inkSoft,
    fontSize: 15,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  sectionTitle: {
    color: colors.ink,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.inkSoft,
    lineHeight: 20,
  },
  altText: {
    color: colors.inkSoft,
    lineHeight: 22,
  },
  primaryButton: {
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
    backgroundColor: colors.card,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: '700',
  },
  success: {
    color: colors.success,
    textAlign: 'center',
  },
});