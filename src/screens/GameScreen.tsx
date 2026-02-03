import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
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
const BOX = 3;

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

const isSolved = (entries: number[], solution: number[]) =>
  entries.every((value, idx) => value !== 0 && value === solution[idx]);

const computeConflicts = (entries: number[]) => {
  const conflicts = Array.from({ length: SIZE * SIZE }, () => false);
  const markGroup = (indices: number[]) => {
    const seen: Record<number, number[]> = {};
    for (const idx of indices) {
      const value = entries[idx];
      if (value === 0) continue;
      if (!seen[value]) seen[value] = [];
      seen[value].push(idx);
    }
    Object.values(seen).forEach((list) => {
      if (list.length > 1) {
        list.forEach((idx) => {
          conflicts[idx] = true;
        });
      }
    });
  };

  for (let r = 0; r < SIZE; r += 1) {
    markGroup(Array.from({ length: SIZE }, (_, c) => r * SIZE + c));
  }
  for (let c = 0; c < SIZE; c += 1) {
    markGroup(Array.from({ length: SIZE }, (_, r) => r * SIZE + c));
  }
  for (let br = 0; br < BOX; br += 1) {
    for (let bc = 0; bc < BOX; bc += 1) {
      const indices: number[] = [];
      for (let r = 0; r < BOX; r += 1) {
        for (let c = 0; c < BOX; c += 1) {
          indices.push((br * BOX + r) * SIZE + (bc * BOX + c));
        }
      }
      markGroup(indices);
    }
  }
  return conflicts;
};

const evaluateProgress = (entries: number[], solution: number[]) => {
  let hasWrong = false;
  let hasEmpty = false;
  for (let i = 0; i < entries.length; i += 1) {
    const value = entries[i];
    if (value === 0) {
      hasEmpty = true;
    } else if (value !== solution[i]) {
      hasWrong = true;
    }
  }
  if (hasWrong) return '오답이 포함되어 있어요.';
  if (hasEmpty) return '현재까지는 맞아요. 아직 빈 칸이 있어요.';
  return '현재까지 전부 정답이에요!';
};

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

const applyMoveToGame = (
  state: SudokuGameState,
  index: number,
  nextValue: number,
  nextNotes: string
) => {
  if (state.given[index]) return null;
  const prevValue = state.entries[index];
  const prevNotes = state.notes[index];
  if (prevValue === nextValue && prevNotes === nextNotes) return null;

  const entries = state.entries.slice();
  const notes = state.notes.slice();
  entries[index] = nextValue;
  notes[index] = nextNotes;

  const move = {
    index,
    prevValue,
    nextValue,
    prevNotes,
    nextNotes,
  };

  return {
    ...state,
    entries,
    notes,
    undoStack: [...state.undoStack, move],
    redoStack: [],
  };
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
  const [showCheck, setShowCheck] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  const sessionStartRef = useRef<number>(Date.now());

  const currentElapsedSec = useMemo(() => {
    if (!game) return 0;
    return (
      game.elapsedSec + Math.floor((Date.now() - sessionStartRef.current) / 1000)
    );
  }, [game, tick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        setGame((prev) => {
          if (!prev || prev.completed) return prev;
          const now = Date.now();
          const added = Math.floor((now - sessionStartRef.current) / 1000);
          sessionStartRef.current = now;
          const updated = {
            ...prev,
            elapsedSec: prev.elapsedSec + added,
          };
          saveCurrentGame(updated);
          return updated;
        });
      } else if (nextAppState === 'active') {
        sessionStartRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
    return computeConflicts(game.entries);
  }, [game]);

  const numberCounts = useMemo(() => {
    if (!game) return Array.from({ length: SIZE }, () => 0);
    const counts = Array.from({ length: SIZE }, () => 0);
    game.entries.forEach((value) => {
      if (value >= 1 && value <= 9) counts[value - 1] += 1;
    });
    return counts;
  }, [game]);

  const updateGame = (nextGame: SudokuGameState) => {
    setGame(nextGame);
    const payload = {
      ...nextGame,
      elapsedSec:
        nextGame.elapsedSec +
        Math.floor((Date.now() - sessionStartRef.current) / 1000),
    };
    saveCurrentGame(payload);
  };

  const handleNumber = (value: number) => {
    if (selectedIndex === null || !game) return;
    if (noteMode) {
      if (game.entries[selectedIndex] !== 0) return;
      const nextNotes = toggleNote(game.notes[selectedIndex], value);
      const nextGame = applyMoveToGame(game, selectedIndex, 0, nextNotes);
      if (nextGame) updateGame(nextGame);
      return;
    }
    const nextGame = applyMoveToGame(game, selectedIndex, value, '');
    if (nextGame) updateGame(nextGame);
  };

  const handleErase = () => {
    if (selectedIndex === null || !game) return;
    if (game.entries[selectedIndex] !== 0) {
      const nextGame = applyMoveToGame(game, selectedIndex, 0, '');
      if (nextGame) updateGame(nextGame);
      return;
    }
    if (game.notes[selectedIndex]) {
      const nextGame = applyMoveToGame(game, selectedIndex, 0, '');
      if (nextGame) updateGame(nextGame);
    }
  };

  const handleHint = () => {
    if (
      !game ||
      game.hintsLeft <= 0 ||
      selectedIndex === null ||
      game.entries[selectedIndex] !== 0
    )
      return;

    const nextValue = game.solution[selectedIndex];
    const baseNext = applyMoveToGame(game, selectedIndex, nextValue, '');
    if (!baseNext) return;
    const nextGame = {
      ...baseNext,
      hintsLeft: Math.max(0, baseNext.hintsLeft - 1),
    };
    updateGame(nextGame);
  };

  const hintDisabled =
    !game ||
    game.hintsLeft <= 0 ||
    selectedIndex === null ||
    game.entries[selectedIndex] !== 0;

  const handleUndo = () => {
    if (!game || game.undoStack.length === 0) return;
    const last = game.undoStack[game.undoStack.length - 1];
    const entries = game.entries.slice();
    const notes = game.notes.slice();
    entries[last.index] = last.prevValue;
    notes[last.index] = last.prevNotes;
    const nextGame = {
      ...game,
      entries,
      notes,
      undoStack: game.undoStack.slice(0, -1),
      redoStack: [...game.redoStack, last],
    };
    updateGame(nextGame);
  };

  const handleRedo = () => {
    if (!game || game.redoStack.length === 0) return;
    const last = game.redoStack[game.redoStack.length - 1];
    const entries = game.entries.slice();
    const notes = game.notes.slice();
    entries[last.index] = last.nextValue;
    notes[last.index] = last.nextNotes;
    const nextGame = {
      ...game,
      entries,
      notes,
      undoStack: [...game.undoStack, last],
      redoStack: game.redoStack.slice(0, -1),
    };
    updateGame(nextGame);
  };

  const handleCheck = () => {
    if (!game) return;
    setCheckMessage(evaluateProgress(game.entries, game.solution));
    setShowCheck(true);
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

      <View style={styles.gameBoard}>
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
          hintDisabled={hintDisabled}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCheck={handleCheck}
          numberCounts={numberCounts}
          noteMode={noteMode}
          undoDisabled={game.undoStack.length === 0}
          redoDisabled={game.redoStack.length === 0}
        />
      </View>

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

      {showCheck && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Check Result</Text>
            <Text style={styles.modalText}>{checkMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowCheck(false)}
            >
              <Text style={styles.modalButtonText}>닫기</Text>
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
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  loadingText: {
    color: '#F48FB1',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backText: {
    color: '#F48FB1',
    fontWeight: '700',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F48FB1',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#8D6E63',
    fontWeight: '600',
    marginTop: 2,
  },
  hintText: {
    color: '#FFB74D',
    fontWeight: '700',
    fontSize: 16,
  },
  gridWrap: {
    alignItems: 'center',
    shadowColor: '#F48FB1',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 245, 247, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#F48FB1',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#81D4FA',
    marginBottom: 8,
  },
  modalText: {
    marginTop: 4,
    color: '#8D6E63',
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: 24,
    backgroundColor: '#81D4FA',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#81D4FA',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
});
