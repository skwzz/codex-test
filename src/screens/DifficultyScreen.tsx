import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Difficulty } from '../lib/sudoku';
import type { RootStackParamList } from '../types/navigation';

const difficulties: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy', label: 'Easy', desc: 'More clues, gentle pace' },
  { key: 'medium', label: 'Medium', desc: 'Balanced challenge' },
  { key: 'hard', label: 'Hard', desc: 'Fewer clues' },
];

export default function DifficultyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose difficulty</Text>
      <View style={styles.list}>
        {difficulties.map((item) => (
          <Pressable
            key={item.key}
            style={styles.card}
            onPress={() => navigation.navigate('Game', { difficulty: item.key })}
          >
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F48FB1',
    marginBottom: 32,
    textAlign: 'center',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#F48FB1',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#81D4FA',
  },
  cardDesc: {
    marginTop: 8,
    color: '#8D6E63',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
