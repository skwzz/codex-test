export type Difficulty = 'easy' | 'medium' | 'hard';

export type GeneratedPuzzle = {
  puzzle: number[];
  solution: number[];
  given: boolean[];
};

const SIZE = 9;
const BOX = 3;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const shuffle = <T>(arr: T[]) => {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const idxToRow = (idx: number) => Math.floor(idx / SIZE);
const idxToCol = (idx: number) => idx % SIZE;

const rowColToIdx = (r: number, c: number) => r * SIZE + c;

const isValidPlacement = (grid: number[], idx: number, value: number) => {
  const row = idxToRow(idx);
  const col = idxToCol(idx);
  for (let i = 0; i < SIZE; i += 1) {
    if (grid[rowColToIdx(row, i)] === value) return false;
    if (grid[rowColToIdx(i, col)] === value) return false;
  }
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = 0; r < BOX; r += 1) {
    for (let c = 0; c < BOX; c += 1) {
      if (grid[rowColToIdx(boxRow + r, boxCol + c)] === value) return false;
    }
  }
  return true;
};

const getCandidates = (grid: number[], idx: number) => {
  const candidates: number[] = [];
  for (let n = 1; n <= SIZE; n += 1) {
    if (isValidPlacement(grid, idx, n)) candidates.push(n);
  }
  return candidates;
};

const findEmptyCell = (grid: number[]) => {
  let bestIdx = -1;
  let bestCandidates: number[] | null = null;
  for (let i = 0; i < grid.length; i += 1) {
    if (grid[i] !== 0) continue;
    const candidates = getCandidates(grid, i);
    if (candidates.length === 0) return { idx: i, candidates };
    if (!bestCandidates || candidates.length < bestCandidates.length) {
      bestCandidates = candidates;
      bestIdx = i;
      if (candidates.length === 1) break;
    }
  }
  return { idx: bestIdx, candidates: bestCandidates };
};

const solveGrid = (grid: number[]) => {
  const { idx, candidates } = findEmptyCell(grid);
  if (idx === -1) return true;
  if (!candidates) return false;
  for (const value of shuffle(candidates)) {
    if (!isValidPlacement(grid, idx, value)) continue;
    grid[idx] = value;
    if (solveGrid(grid)) return true;
    grid[idx] = 0;
  }
  return false;
};

const countSolutions = (grid: number[], limit = 2) => {
  const { idx, candidates } = findEmptyCell(grid);
  if (idx === -1) return 1;
  if (!candidates || candidates.length === 0) return 0;
  let count = 0;
  for (const value of candidates) {
    if (!isValidPlacement(grid, idx, value)) continue;
    grid[idx] = value;
    count += countSolutions(grid, limit - count);
    if (count >= limit) {
      grid[idx] = 0;
      return count;
    }
    grid[idx] = 0;
  }
  return count;
};

const generateSolvedGrid = () => {
  const grid = range(SIZE * SIZE).map(() => 0);
  solveGrid(grid);
  return grid;
};

const cluesForDifficulty = (difficulty: Difficulty) => {
  if (difficulty === 'easy') return 40;
  if (difficulty === 'medium') return 34;
  return 28;
};

const removeCellsForPuzzle = (solution: number[], difficulty: Difficulty) => {
  const targetClues = cluesForDifficulty(difficulty);
  const targetHoles = SIZE * SIZE - targetClues;
  const puzzle = solution.slice();
  const positions = shuffle(range(SIZE * SIZE));
  let removed = 0;
  for (const idx of positions) {
    if (removed >= targetHoles) break;
    const backup = puzzle[idx];
    puzzle[idx] = 0;
    const checkGrid = puzzle.slice();
    const solutions = countSolutions(checkGrid, 2);
    if (solutions !== 1) {
      puzzle[idx] = backup;
    } else {
      removed += 1;
    }
  }
  return { puzzle, removed };
};

export const generatePuzzle = (difficulty: Difficulty): GeneratedPuzzle => {
  let attempts = 0;
  while (attempts < 5) {
    attempts += 1;
    const solution = generateSolvedGrid();
    const { puzzle, removed } = removeCellsForPuzzle(solution, difficulty);
    const targetHoles = SIZE * SIZE - cluesForDifficulty(difficulty);
    if (removed >= targetHoles) {
      return {
        puzzle,
        solution,
        given: puzzle.map((v) => v !== 0),
      };
    }
  }
  const fallbackSolution = generateSolvedGrid();
  const { puzzle } = removeCellsForPuzzle(fallbackSolution, difficulty);
  return {
    puzzle,
    solution: fallbackSolution,
    given: puzzle.map((v) => v !== 0),
  };
};

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  return `${mm}:${ss}`;
};
