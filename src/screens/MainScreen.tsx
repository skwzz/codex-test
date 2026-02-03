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
      <Text style={styles.footer}>^^</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    padding: 24,
    justifyContent: 'space-between',
  },
  hero: {
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F48FB1',
    letterSpacing: -1,
    textShadowColor: 'rgba(244, 143, 177, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    color: '#8D6E63',
    fontWeight: '600',
  },
  card: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: 16,
    shadowColor: '#F48FB1',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#81D4FA',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#81D4FA',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#81D4FA',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#81D4FA',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#CFD8DC',
  },
  footer: {
    textAlign: 'center',
    color: '#BCAAA4',
    paddingBottom: 12,
    fontWeight: '500',
  },
});
