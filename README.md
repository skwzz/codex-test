# Sudoku (React Native)

Android-only offline Sudoku built with Expo + TypeScript.

## Features
- 9x9 classic Sudoku
- Difficulty: Easy / Medium / Hard
- Notes (pencil marks)
- Real-time validation with error highlighting
- Hints (3 per game)
- Undo / Redo
- Continue last game
- Local history: start time + clear time

## Tech Stack
- Expo (React Native)
- TypeScript
- React Navigation
- AsyncStorage

## Getting Started
```bash
npm install
npm run android
```

## Scripts
- `npm run android`
- `npm run start`

## Project Structure
```
src/
  components/
  lib/
  screens/
  types/
```

## Notes
- This project targets Android only.
- If you see Node engine warnings, upgrade to a newer Node 20.x.
