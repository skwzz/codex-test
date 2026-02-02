import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loadCurrentGame } from '../lib/storage';
import type { RootStackParamList } from '../types/navigation';

export default function MainScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [hasContinue, setHasContinue] = useState(false);

  const refresh = useCallback(() => {
    let active = true;
    loadCurrentGame().then((game) => {
      if (active) setHasContinue(!!game && !game.completed);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(refresh);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.subtitle}>Classic 9x9 with pencil notes</Text>
      </View>
      <View style={styles.card}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Difficulty')}
        >
          <Text style={styles.primaryText}>New Game</Text>
        </Pressable>
        <Pressable
          style={[
            styles.secondaryButton,
            !hasContinue && styles.disabledButton,
          ]}
          onPress={() => navigation.navigate('Game', { resume: true })}
          disabled={!hasContinue}
        >
          <Text style={styles.secondaryText}>Continue</Text>
        </Pressable>
      </View>
      <Text style={styles.footer}>Inspired by Andoku 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3efe9',
    padding: 24,
    justifyContent: 'space-between',
  },
  hero: {
    paddingTop: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1f2a44',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#5c5c5c',
  },
  card: {
    padding: 20,
    backgroundColor: '#fffaf4',
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#1f2a44',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#f6f5f3',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1f2a44',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#1f2a44',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.4,
  },
  footer: {
    textAlign: 'center',
    color: '#8b867f',
    paddingBottom: 12,
  },
});
