import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import { useTheme } from '@/theme/ThemeProvider';

export interface PosAction {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

interface PosActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: PosAction[];
}

const PosActionsSheet = ({ visible, onClose, actions }: PosActionsSheetProps) => {
  const theme = useTheme();

  return (
    <Modal visible={visible} onClose={onClose} title="Más opciones">
      <View>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            disabled={action.disabled}
            onPress={() => {
              onClose();
              action.onPress();
            }}
            style={[
              styles.row,
              { borderBottomColor: theme.colors.border, opacity: action.disabled ? 0.5 : 1 },
            ]}
          >
            <MaterialIcons name={action.icon} size={22} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, marginLeft: theme.spacing.md, fontSize: theme.typography.fontSize.md }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default PosActionsSheet;
