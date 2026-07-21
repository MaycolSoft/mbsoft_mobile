import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import TextInput from '@/components/TextInput';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ value, onChange, placeholder }: TagInputProps) => {
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder={placeholder}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addTag}
            returnKeyType="done"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <TouchableOpacity
          onPress={addTag}
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md },
          ]}
        >
          <MaterialIcons name="add" size={22} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {value.length > 0 && (
        <View style={styles.tagsRow}>
          {value.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.full,
                  paddingLeft: theme.spacing.md,
                  paddingRight: theme.spacing.sm,
                },
              ]}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.sm }}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)} style={{ marginLeft: 6 }} hitSlop={8}>
                <MaterialIcons name="close" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    height: 46,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
});

export default TagInput;
