import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './sudoku';

export type Move = {
  index: number;
  prevValue: number;
  nextValue: number;
  prevNotes: string;
  nextNotes: string;
};

export type SudokuGameState = {
  id: string;
  difficulty: Difficulty;
  puzzle: number[];
  solution: number[];
  given: boolean[];
  entries: number[];
  notes: string[];
  hintsLeft: number;
  startedAt: number;
  elapsedSec: number;
  undoStack: Move[];
  redoStack: Move[];
  completed?: boolean;
};

export type GameHistoryEntry = {
  id: string;
  difficulty: Difficulty;
  startedAt: number;
  completedAt: number;
  durationSec: number;
};

const CURRENT_GAME_KEY = 'sudoku.currentGame';
const HISTORY_KEY = 'sudoku.history';

export const loadCurrentGame = async (): Promise<SudokuGameState | null> => {
  const raw = await AsyncStorage.getItem(CURRENT_GAME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SudokuGameState;
  } catch {
    return null;
  }
};

export const saveCurrentGame = async (game: SudokuGameState) => {
  await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
};

export const clearCurrentGame = async () => {
  await AsyncStorage.removeItem(CURRENT_GAME_KEY);
};

export const loadHistory = async (): Promise<GameHistoryEntry[]> => {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GameHistoryEntry[];
  } catch {
    return [];
  }
};

export const appendHistory = async (entry: GameHistoryEntry) => {
  const history = await loadHistory();
  history.push(entry);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};
