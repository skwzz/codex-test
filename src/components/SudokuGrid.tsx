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
                  <View style={styles.notesGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <View key={n} style={styles.noteCell}>
                        <Text
                          style={[
                            styles.noteText,
                            {
                              fontSize: cellSize / 3.5,
                              opacity: notes[idx].includes(n.toString()) ? 1 : 0,
                            },
                          ]}
                        >
                          {n}
                        </Text>
                      </View>
                    ))}
                  </View>
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
    borderColor: '#F48FB1',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#F8BBD0',
    backgroundColor: '#FFFFFF',
  },
  cellBorderTop: {
    borderTopWidth: 2,
    borderTopColor: '#F48FB1',
  },
  cellBorderLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#F48FB1',
  },
  cellBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#F48FB1',
  },
  cellBorderRight: {
    borderRightWidth: 2,
    borderRightColor: '#F48FB1',
  },
  cellSelected: {
    backgroundColor: '#E1BEE7',
  },
  cellRelated: {
    backgroundColor: '#F3E5F5',
  },
  cellSameValue: {
    backgroundColor: '#FFF59D',
  },
  cellGiven: {
    backgroundColor: '#FFFDE7',
  },
  cellText: {
    color: '#8E24AA',
    fontWeight: '700',
  },
  cellTextGiven: {
    color: '#5D4037',
  },
  cellTextError: {
    color: '#FF8A80',
  },
  notesGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    color: '#9FA8DA',
    fontWeight: '600',
  },
});
