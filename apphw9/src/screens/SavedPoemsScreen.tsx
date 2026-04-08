import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/theme';
import { useAppState } from '../state/AppStateContext';

export function SavedPoemsScreen() {
  const { savedPoems, deletePoem } = useAppState();

  return (
    <View style={styles.container}>
      {savedPoems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No saved poems yet</Text>
          <Text style={styles.emptyText}>Recommend one from Input and save it here.</Text>
        </View>
      ) : (
        <FlatList
          data={savedPoems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.lineText}>{item.line_text}</Text>
              <Text style={styles.meta}>
                {item.title} · {item.author} · {item.dynasty}
              </Text>
              <Text style={styles.reason} numberOfLines={2}>
                {item.short_reason}
              </Text>
              <Text style={styles.time}>{new Date(item.saved_at).toLocaleString()}</Text>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePoem(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  lineText: {
    fontSize: 18,
    color: colors.ink,
    fontWeight: '700',
  },
  meta: {
    color: colors.inkSoft,
  },
  reason: {
    color: colors.inkSoft,
    lineHeight: 20,
  },
  time: {
    color: colors.inkSoft,
    fontSize: 12,
  },
  deleteBtn: {
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.inkSoft,
    marginTop: 8,
    textAlign: 'center',
  },
});