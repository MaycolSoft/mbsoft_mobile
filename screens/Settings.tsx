import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import useStore from '@/store/useStore';
import { useTheme } from '@/theme/ThemeProvider';
import { accentSwatches, cardTintSwatches, TextSizeKey } from '@/theme/theme';
import SettingsSection from '@/components/SettingsSection';
import SettingsRow from '@/components/SettingsRow';
import ColorSwatchPicker from '@/components/ColorSwatchPicker';
import Button from '@/components/Button';
import { showAlert } from '@/components/AppAlert';

const TEXT_SIZE_OPTIONS: { key: TextSizeKey; label: string }[] = [
  { key: 'small', label: 'Chico' },
  { key: 'medium', label: 'Mediano' },
  { key: 'large', label: 'Grande' },
];

export default function Settings() {
  const theme = useTheme();
  const { config, toggleDarkMode, updateConfig } = useStore();

  const notImplemented = (feature: string) => {
    showAlert(feature, 'Todavía no está conectado — lo vamos a integrar más adelante.');
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
    >
      <SettingsSection title="Apariencia">
        <SettingsRow label="Modo oscuro" description="Cambia los colores de toda la app">
          <Switch
            value={config.darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </SettingsRow>

        <SettingsRow label="Color principal" description="Botones, links y elementos activos" stacked>
          <ColorSwatchPicker
            swatches={accentSwatches}
            value={config.accentColor}
            onSelect={(key) => updateConfig({ accentColor: key })}
          />
        </SettingsRow>

        <SettingsRow label="Color de tarjetas" description="Fondo de las tarjetas y paneles" stacked>
          <ColorSwatchPicker
            swatches={cardTintSwatches}
            value={config.cardTint}
            onSelect={(key) => updateConfig({ cardTint: key })}
          />
        </SettingsRow>

        <SettingsRow label="Tamaño de texto" last stacked>
          <View style={[styles.segmented, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
            {TEXT_SIZE_OPTIONS.map((option, index) => {
              const selected = (config.textSize ?? 'medium') === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => updateConfig({ textSize: option.key })}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: selected ? theme.colors.primary : 'transparent',
                      borderLeftWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                      borderLeftColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selected ? theme.colors.onPrimary : theme.colors.text,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: selected ? '700' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Impresoras">
        <SettingsRow
          label="Impresoras conectadas"
          description="No hay impresoras conectadas todavía"
          last
        />
      </SettingsSection>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Button
          title="Buscar impresoras"
          variant="light"
          onPress={() => notImplemented('Buscar impresoras')}
          style={{ flex: 1 }}
        />
        <Button
          title="Probar impresión"
          variant="light"
          onPress={() => notImplemented('Probar impresión')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
});
