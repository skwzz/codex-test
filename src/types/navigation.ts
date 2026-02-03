import type { Difficulty } from '../lib/sudoku';

export type RootStackParamList = {
  Main: undefined;
  Difficulty: undefined;
  Game: { difficulty?: Difficulty; resume?: boolean };
  History: undefined;
};
