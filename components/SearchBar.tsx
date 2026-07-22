import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TextInput from '@/components/TextInput';
import { useTheme } from '@/theme/ThemeProvider';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onSubmitEditing: () => void;
  toggleViewStyle: () => void;
  viewStyle: 'grid' | 'list';
  loading?: boolean;
  loadedCount?: number;
  totalResults?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  setSearchText,
  onSubmitEditing,
  toggleViewStyle,
  viewStyle,
  loading = false,
  loadedCount = 0,
  totalResults = 0,
}) => {
  const theme = useTheme();
  const hasSearch = searchText.trim().length > 0;
  const resultLabel = loading && loadedCount === 0
    ? 'Buscando…'
    : `${totalResults} ${totalResults === 1 ? 'producto' : 'productos'}`;

  return (
    <View style={[styles.container, { paddingHorizontal: theme.spacing.sm, paddingTop: theme.spacing.sm }]}>
      <View style={[styles.searchRow, { gap: theme.spacing.sm }]}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Referencia, descripción o categoría"
            iconName="search"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="never"
            containerStyle={styles.textInput}
          />
        </View>

        <TouchableOpacity
          onPress={() => setSearchText('')}
          disabled={!hasSearch}
          accessibilityLabel="Limpiar búsqueda"
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: hasSearch ? 1 : 0.4,
            },
          ]}
        >
          <MaterialIcons name="close" size={21} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleViewStyle}
          accessibilityLabel={viewStyle === 'list' ? 'Cambiar a cuadrícula' : 'Cambiar a lista'}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <MaterialIcons
            name={viewStyle === 'list' ? 'view-module' : 'view-list'}
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchMeta}>
        <View style={styles.scopeHint}>
          <MaterialIcons name="manage-search" size={15} color={theme.colors.textMuted} />
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs }}>
            Referencia, descripción y categoría
          </Text>
        </View>
        <Text style={{ color: loading ? theme.colors.primary : theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, fontWeight: '600' }}>
          {resultLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    marginBottom: 0,
  },
  iconButton: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    paddingHorizontal: 2,
    gap: 8,
  },
  scopeHint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default SearchBar;
