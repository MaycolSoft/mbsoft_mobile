import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AppModal = ({ visible, onClose, title, children, footer }: AppModalProps) => {
  const theme = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, ...theme.shadow },
              ]}
            >
              <View
                style={[
                  styles.header,
                  { borderBottomColor: theme.colors.border, padding: theme.spacing.lg },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: '700',
                    flex: 1,
                  }}
                >
                  {title}
                </Text>

                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} contentContainerStyle={{ padding: theme.spacing.lg }}>
                {children}
              </ScrollView>

              {footer && (
                <View
                  style={[
                    styles.footer,
                    { borderTopColor: theme.colors.border, padding: theme.spacing.lg },
                  ]}
                >
                  {footer}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flexGrow: 0,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default AppModal;
