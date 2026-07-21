import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  initialKey?: string;
}

const Tabs = ({ tabs, initialKey }: TabsProps) => {
  const theme = useTheme();
  const [activeKey, setActiveKey] = useState(initialKey ?? tabs[0]?.key);

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
      >
        {tabs.map((tab) => {
          const selected = tab.key === activeTab?.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveKey(tab.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                  borderRadius: theme.radius.full,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.lg,
                  marginVertical: theme.spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? theme.colors.onPrimary : theme.colors.textMuted,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: selected ? '700' : '500',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flex: 1 }}>{activeTab?.content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Tabs;
