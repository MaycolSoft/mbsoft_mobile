import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface AppAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AppAlertOptions {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
}

export interface AppAlertHandle {
  show: (options: AppAlertOptions) => void;
}

let alertRef: AppAlertHandle | null = null;

export function showAlert(title: string, message?: string, buttons?: AppAlertButton[]) {
  alertRef?.show({ title, message, buttons });
}

const AppAlertHost = forwardRef<AppAlertHandle>((_props, ref) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AppAlertOptions>({ title: '' });

  useImperativeHandle(ref, () => ({
    show: (opts) => {
      setOptions(opts);
      setVisible(true);
    },
  }));

  const close = () => setVisible(false);

  const handlePress = (button: AppAlertButton) => {
    close();
    button.onPress?.();
  };

  const buttons = options.buttons?.length ? options.buttons : [{ text: 'OK', style: 'default' as const }];
  const stacked = buttons.length > 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: theme.spacing.xxl },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: '700',
                  marginBottom: options.message ? theme.spacing.sm : theme.spacing.xl,
                  textAlign: 'center',
                }}
              >
                {options.title}
              </Text>

              {options.message && (
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: theme.typography.fontSize.md,
                    marginBottom: theme.spacing.xl,
                    textAlign: 'center',
                  }}
                >
                  {options.message}
                </Text>
              )}

              <View style={stacked ? styles.buttonsColumn : styles.buttonsRow}>
                {buttons.map((button, index) => {
                  const color =
                    button.style === 'destructive'
                      ? theme.colors.danger
                      : button.style === 'cancel'
                      ? theme.colors.textMuted
                      : theme.colors.primary;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePress(button)}
                      style={[
                        styles.button,
                        stacked
                          ? { borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }
                          : { borderLeftWidth: index === 0 ? 0 : StyleSheet.hairlineWidth, borderLeftColor: theme.colors.border, flex: 1 },
                      ]}
                    >
                      <Text
                        style={{
                          color,
                          fontSize: theme.typography.fontSize.md,
                          fontWeight: button.style === 'cancel' ? '400' : '700',
                        }}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

export function AppAlertProvider() {
  const setRef = (instance: AppAlertHandle | null) => {
    alertRef = instance;
  };

  return <AppAlertHost ref={setRef} />;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginHorizontal: -24,
    marginBottom: -24,
  },
  buttonsColumn: {
    marginHorizontal: -24,
    marginBottom: -24,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});

export default AppAlertHost;
