import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Dropdown from './Dropdown';
import TextInput from '@/components/TextInput';
import { useTheme } from '@/theme/ThemeProvider';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onSubmitEditing: () => void;
  setFilterField: (field: string) => void;
  toggleViewStyle: () => void;
  viewStyle: string; // 'list' | 'grid'
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  setSearchText,
  onSubmitEditing,
  setFilterField,
  toggleViewStyle,
  viewStyle,
}) => {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: theme.spacing.sm, gap: theme.spacing.sm }}>
      <View style={{ flex: 1 }}>
        <TextInput
          placeholder="Escribe para buscar..."
          iconName="search"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSubmitEditing}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <Dropdown
        onSelect={(option) => setFilterField(`${option.value}`)}
        options={[
          { label: 'Descripción', value: 'description' },
          { label: 'Referencia', value: 'reference' },
          { label: 'Categoría', value: 'categoria' },
          { label: 'Unidad', value: 'unidad' },
          { label: 'Impuesto', value: 'tax' },
        ]}
        iconMode
        style={{ width: 46, height: 46, justifyContent: 'center' }}
      />

      <TouchableOpacity
        onPress={toggleViewStyle}
        style={{
          width: 46,
          height: 46,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <MaterialIcons
          name={viewStyle === 'list' ? 'view-module' : 'view-list'}
          size={22}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
