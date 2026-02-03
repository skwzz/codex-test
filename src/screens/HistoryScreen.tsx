import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loadHistory, type GameHistoryEntry } from '../lib/storage';
import { formatDuration } from '../lib/sudoku';
import type { RootStackParamList } from '../types/navigation';

type HistoryItemProps = {
  item: GameHistoryEntry;
};

const HistoryItem = ({ item }: HistoryItemProps) => {
  const started = new Date(item.startedAt).toLocaleString();
  const completed = new Date(item.completedAt).toLocaleString();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.difficulty.toUpperCase()}</Text>
      <Text style={styles.cardText}>Started: {started}</Text>
      <Text style={styles.cardText}>Cleared: {completed}</Text>
      <Text style={styles.cardText}>Time: {formatDuration(item.durationSec)}</Text>
    </View>
  );
};

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  const refresh = useCallback(() => {
    let active = true;
    loadHistory().then((items) => {
      if (!active) return;
      setHistory(items.slice().reverse());
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(refresh);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Main')}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>Clear a puzzle to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  backText: {
    color: '#F48FB1',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F48FB1',
  },
  headerSpacer: {
    width: 40,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#F48FB1',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#81D4FA',
    marginBottom: 6,
  },
  cardText: {
    color: '#8D6E63',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F48FB1',
  },
  emptyText: {
    marginTop: 6,
    color: '#8D6E63',
    fontWeight: '600',
  },
});
