import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  entries: number[];
  given: boolean[];
  notes: string[];
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
  errors: boolean[];
  cellSize: number;
};

const SIZE = 9;
const BOX = 3;

const idxToRow = (idx: number) => Math.floor(idx / SIZE);
const idxToCol = (idx: number) => idx % SIZE;

const isSameBox = (a: number, b: number) => {
  const ra = Math.floor(idxToRow(a) / BOX);
  const ca = Math.floor(idxToCol(a) / BOX);
  const rb = Math.floor(idxToRow(b) / BOX);
  const cb = Math.floor(idxToCol(b) / BOX);
  return ra === rb && ca === cb;
};

export default function SudokuGrid({
  entries,
  given,
  notes,
  selectedIndex,
  onSelect,
  errors,
  cellSize,
}: Props) {
  const selectedValue = selectedIndex !== null ? entries[selectedIndex] : 0;
  const valueFont = Math.max(16, Math.floor(cellSize * 0.55));
  const noteFont = Math.max(8, Math.floor(cellSize * 0.22));

  return (
    <View style={styles.grid}>
      {Array.from({ length: SIZE }).map((_, row) => (
        <View key={`row-${row}`} style={styles.row}>
          {Array.from({ length: SIZE }).map((_, col) => {
            const idx = row * SIZE + col;
            const value = entries[idx];
            const isSelected = selectedIndex === idx;
            const isRelated =
              selectedIndex !== null &&
              (row === idxToRow(selectedIndex) ||
                col === idxToCol(selectedIndex) ||
                isSameBox(idx, selectedIndex));
            const isSameValue =
              selectedValue !== 0 && value === selectedValue && idx !== selectedIndex;

            return (
              <Pressable
                key={`cell-${idx}`}
                onPress={() => onSelect(idx)}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  row % BOX === 0 && styles.cellBorderTop,
                  col % BOX === 0 && styles.cellBorderLeft,
                  row === SIZE - 1 && styles.cellBorderBottom,
                  col === SIZE - 1 && styles.cellBorderRight,
                  isRelated && styles.cellRelated,
                  isSameValue && styles.cellSameValue,
                  isSelected && styles.cellSelected,
                  given[idx] && styles.cellGiven,
                ]}
              >
                {value !== 0 ? (
                  <Text
                    style={[
                      styles.cellText,
                      { fontSize: valueFont },
                      given[idx] && styles.cellTextGiven,
                      errors[idx] && styles.cellTextError,
                    ]}
                  >
                    {value}
                  </Text>
                ) : notes[idx] ? (
                  <Text style={[styles.cellNotes, { fontSize: noteFont }]}>
                    {notes[idx]}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderColor: '#2b2b2b',
    backgroundColor: '#f6f5f3',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#b8b5af',
    backgroundColor: '#faf9f7',
  },
  cellBorderTop: {
    borderTopWidth: 2,
    borderTopColor: '#2b2b2b',
  },
  cellBorderLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#2b2b2b',
  },
  cellBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#2b2b2b',
  },
  cellBorderRight: {
    borderRightWidth: 2,
    borderRightColor: '#2b2b2b',
  },
  cellSelected: {
    backgroundColor: '#cfe2ff',
  },
  cellRelated: {
    backgroundColor: '#e9f0ff',
  },
  cellSameValue: {
    backgroundColor: '#f1e6ff',
  },
  cellGiven: {
    backgroundColor: '#efedeb',
  },
  cellText: {
    color: '#1f1f1f',
    fontWeight: '600',
  },
  cellTextGiven: {
    color: '#1a1a1a',
  },
  cellTextError: {
    color: '#c62828',
  },
  cellNotes: {
    color: '#6b6b6b',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
