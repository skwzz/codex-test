import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onNumber: (value: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  onCheck: () => void;
  numberCounts: number[];
  hintsLeft: number;
  hintDisabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  noteMode: boolean;
  undoDisabled: boolean;
  redoDisabled: boolean;
};

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function NumberPad({
  onNumber,
  onErase,
  onToggleNotes,
  onHint,
  onCheck,
  numberCounts,
  hintsLeft,
  hintDisabled,
  onUndo,
  onRedo,
  noteMode,
  undoDisabled,
  redoDisabled,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.numberRow}>
        {numbers.map((value) => {
          const filled = numberCounts[value - 1] >= 9;
          return (
            <Pressable
              key={`num-${value}`}
              onPress={() => onNumber(value)}
              style={[styles.numberButton, filled && styles.numberButtonFilled]}
            >
              <Text style={styles.numberText}>{value}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onToggleNotes}
          style={[styles.actionButton, noteMode && styles.actionButtonActive]}
        >
          <Text style={styles.actionText}>{noteMode ? 'Notes On' : 'Notes'}</Text>
        </Pressable>
        <Pressable onPress={onErase} style={styles.actionButton}>
          <Text style={styles.actionText}>Erase</Text>
        </Pressable>
        <Pressable
          onPress={onHint}
          style={[styles.actionButton, hintDisabled && styles.actionButtonDisabled]}
          disabled={hintDisabled}
        >
          <Text style={styles.actionText}>Hint ({hintsLeft})</Text>
        </Pressable>
        <Pressable
          onPress={onUndo}
          style={[styles.actionButton, undoDisabled && styles.actionButtonDisabled]}
          disabled={undoDisabled}
        >
          <Text style={styles.actionText}>Undo</Text>
        </Pressable>
        <Pressable
          onPress={onRedo}
          style={[styles.actionButton, redoDisabled && styles.actionButtonDisabled]}
          disabled={redoDisabled}
        >
          <Text style={styles.actionText}>Redo</Text>
        </Pressable>
        <Pressable onPress={onCheck} style={styles.actionButton}>
          <Text style={styles.actionText}>Check</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  numberButton: {
    width: '30%',
    aspectRatio: 2,
    backgroundColor: '#81D4FA',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#81D4FA',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  numberButtonFilled: {
    opacity: 0.45,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionButton: {
    width: '30%',
    aspectRatio: 2.2,
    backgroundColor: '#FFCC80',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCC80',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonActive: {
    backgroundColor: '#F48FB1',
    transform: [{ scale: 0.98 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionText: {
    color: '#5D4037',
    fontWeight: '700',
    fontSize: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: 14,
  },
});
