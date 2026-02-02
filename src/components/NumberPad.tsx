import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onNumber: (value: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  hintsLeft: number;
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
  hintsLeft,
  onUndo,
  onRedo,
  noteMode,
  undoDisabled,
  redoDisabled,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.numberRow}>
        {numbers.map((value) => (
          <Pressable
            key={`num-${value}`}
            onPress={() => onNumber(value)}
            style={styles.numberButton}
          >
            <Text style={styles.numberText}>{value}</Text>
          </Pressable>
        ))}
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
        <Pressable onPress={onHint} style={styles.actionButton}>
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
    aspectRatio: 1.6,
    backgroundColor: '#1f2a44',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#f6f5f3',
    fontSize: 20,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ece7e1',
    borderRadius: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#ffe6a7',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionText: {
    color: '#2b2b2b',
    fontWeight: '600',
  },
});
