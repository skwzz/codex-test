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
    backgroundColor: '#f3efe9',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2a44',
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fffaf4',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e1d9cf',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2a44',
  },
  cardDesc: {
    marginTop: 6,
    color: '#6b6760',
  },
});
