import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NumberPad from '../components/NumberPad';
import SudokuGrid from '../components/SudokuGrid';
import { formatDuration, generatePuzzle } from '../lib/sudoku';
import {
  appendHistory,
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
  type SudokuGameState,
} from '../lib/storage';
import type { RootStackParamList } from '../types/navigation';
import type { Difficulty } from '../lib/sudoku';

const SIZE = 9;

const createEmptyNotes = () => Array.from({ length: SIZE * SIZE }, () => '');

const createNewGame = (difficulty: Difficulty): SudokuGameState => {
  const { puzzle, solution, given } = generatePuzzle(difficulty);
  return {
    id: `game_${Date.now()}`,
    difficulty,
    puzzle,
    solution,
    given,
    entries: puzzle.slice(),
    notes: createEmptyNotes(),
    hintsLeft: 3,
    startedAt: Date.now(),
    elapsedSec: 0,
    undoStack: [],
    redoStack: [],
  };
};

const computeErrors = (entries: number[], solution: number[]) =>
  entries.map((value, idx) => value !== 0 && value !== solution[idx]);

const isSolved = (entries: number[], solution: number[]) =>
  entries.every((value, idx) => value !== 0 && value === solution[idx]);

const toggleNote = (notes: string, value: number) => {
  const set = new Set(notes.split('').filter(Boolean));
  const val = value.toString();
  if (set.has(val)) {
    set.delete(val);
  } else {
    set.add(val);
  }
  return Array.from(set)
    .sort((a, b) => Number(a) - Number(b))
    .join('');
};

export default function GameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(Math.min(width - 48, 360) / 9);

  const [game, setGame] = useState<SudokuGameState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [tick, setTick] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());

  const currentElapsedSec = useMemo(() => {
    if (!game) return 0;
    return (
      game.elapsedSec + Math.floor((Date.now() - sessionStartRef.current) / 1000)
    );
  }, [game, tick]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (route.params?.resume) {
        const stored = await loadCurrentGame();
        if (stored && active) {
          setGame(stored);
          sessionStartRef.current = Date.now();
          return;
        }
      }
      const difficulty = route.params?.difficulty ?? 'easy';
      const fresh = createNewGame(difficulty);
      if (!active) return;
      setGame(fresh);
      sessionStartRef.current = Date.now();
      await saveCurrentGame(fresh);
    };
    init();
    return () => {
      active = false;
    };
  }, [route.params?.difficulty, route.params?.resume]);

  useEffect(() => {
    if (!game || game.completed) return;
    const interval = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(interval);
  }, [game]);

  useEffect(() => {
    if (!game || game.completed) return;
    const payload = { ...game, elapsedSec: currentElapsedSec };
    saveCurrentGame(payload);
  }, [game, currentElapsedSec]);

  useEffect(() => {
    if (!game || game.completed) return;
    if (isSolved(game.entries, game.solution)) {
      const completedAt = Date.now();
      const durationSec = currentElapsedSec;
      const completedGame = { ...game, completed: true, elapsedSec: durationSec };
      setGame(completedGame);
      appendHistory({
        id: game.id,
        difficulty: game.difficulty,
        startedAt: game.startedAt,
        completedAt,
        durationSec,
      });
      clearCurrentGame();
      setShowComplete(true);
    }
  }, [game, currentElapsedSec]);

  const errors = useMemo(() => {
    if (!game) return Array.from({ length: SIZE * SIZE }, () => false);
    return computeErrors(game.entries, game.solution);
  }, [game]);

  const applyMove = (index: number, nextValue: number, nextNotes: string) => {
    if (!game) return;
    if (game.given[index]) return;
    const prevValue = game.entries[index];
    const prevNotes = game.notes[index];
    if (prevValue === nextValue && prevNotes === nextNotes) return;

    const entries = game.entries.slice();
    const notes = game.notes.slice();
    entries[index] = nextValue;
    notes[index] = nextNotes;

    const move = {
      index,
      prevValue,
      nextValue,
      prevNotes,
      nextNotes,
    };

    setGame({
      ...game,
      entries,
      notes,
      undoStack: [...game.undoStack, move],
      redoStack: [],
    });
  };

  const handleNumber = (value: number) => {
    if (selectedIndex === null || !game) return;
    if (noteMode) {
      if (game.entries[selectedIndex] !== 0) return;
      const nextNotes = toggleNote(game.notes[selectedIndex], value);
      applyMove(selectedIndex, 0, nextNotes);
      return;
    }
    applyMove(selectedIndex, value, '');
  };

  const handleErase = () => {
    if (selectedIndex === null || !game) return;
    if (game.entries[selectedIndex] !== 0) {
      applyMove(selectedIndex, 0, '');
      return;
    }
    if (game.notes[selectedIndex]) {
      applyMove(selectedIndex, 0, '');
    }
  };

  const handleHint = () => {
    if (!game || game.hintsLeft <= 0) return;
    const empties = game.entries
      .map((value, idx) => (value === 0 ? idx : -1))
      .filter((idx) => idx !== -1);
    if (empties.length === 0) return;
    const pick = empties[Math.floor(Math.random() * empties.length)];
    const nextValue = game.solution[pick];
    applyMove(pick, nextValue, '');
    setGame((prev) =>
      prev
        ? {
            ...prev,
            hintsLeft: Math.max(0, prev.hintsLeft - 1),
          }
        : prev
    );
  };

  const handleUndo = () => {
    if (!game || game.undoStack.length === 0) return;
    const last = game.undoStack[game.undoStack.length - 1];
    const entries = game.entries.slice();
    const notes = game.notes.slice();
    entries[last.index] = last.prevValue;
    notes[last.index] = last.prevNotes;
    setGame({
      ...game,
      entries,
      notes,
      undoStack: game.undoStack.slice(0, -1),
      redoStack: [...game.redoStack, last],
    });
  };

  const handleRedo = () => {
    if (!game || game.redoStack.length === 0) return;
    const last = game.redoStack[game.redoStack.length - 1];
    const entries = game.entries.slice();
    const notes = game.notes.slice();
    entries[last.index] = last.nextValue;
    notes[last.index] = last.nextNotes;
    setGame({
      ...game,
      entries,
      notes,
      undoStack: [...game.undoStack, last],
      redoStack: game.redoStack.slice(0, -1),
    });
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Main')}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>{game.difficulty.toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>{formatDuration(currentElapsedSec)}</Text>
        </View>
        <Text style={styles.hintText}>Hints {game.hintsLeft}</Text>
      </View>

      <View style={styles.gridWrap}>
        <SudokuGrid
          entries={game.entries}
          given={game.given}
          notes={game.notes}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          errors={errors}
          cellSize={cellSize}
        />
      </View>

      <NumberPad
        onNumber={handleNumber}
        onErase={handleErase}
        onToggleNotes={() => setNoteMode((v) => !v)}
        onHint={handleHint}
        hintsLeft={game.hintsLeft}
        onUndo={handleUndo}
        onRedo={handleRedo}
        noteMode={noteMode}
        undoDisabled={game.undoStack.length === 0}
        redoDisabled={game.redoStack.length === 0}
      />

      {showComplete && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Puzzle Complete!</Text>
            <Text style={styles.modalText}>
              Time: {formatDuration(currentElapsedSec)}
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowComplete(false);
                navigation.navigate('Main');
              }}
            >
              <Text style={styles.modalButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3efe9',
    padding: 16,
    gap: 16,
  },
  loadingText: {
    color: '#1f2a44',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: {
    color: '#1f2a44',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2a44',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#6b6760',
  },
  hintText: {
    color: '#1f2a44',
    fontWeight: '600',
  },
  gridWrap: {
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fffaf4',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2a44',
  },
  modalText: {
    marginTop: 8,
    color: '#6b6760',
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: '#1f2a44',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#f6f5f3',
    fontWeight: '600',
  },
});
