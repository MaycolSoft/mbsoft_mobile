
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Dropdown from './Dropdown'; // Reemplaza con la ruta correcta de tu componente
import TextInputField from '@/components/InputField';


interface SearchBarProps {
  searchText: string; // Texto de búsqueda actual
  setSearchText: (text: string) => void; // Función para actualizar el texto de búsqueda
  onSubmitEditing: () => void; // Función para ejecutar al enviar el texto
  setFilterField: (field: string) => void; // Función para establecer el campo de filtro
  toggleViewStyle: () => void; // Función para alternar el estilo de vista
  viewStyle:string // 'list' | 'grid'; // Estilo de vista actual
}



const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  setSearchText,
  onSubmitEditing,
  setFilterField,
  toggleViewStyle,
  viewStyle,
}) => {
  return (
    <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 5,
          // borderWidth:1,
          // borderColor:"red"
        }}
      >
        {/* TextInput ocupa el 95% */}
        <TextInputField
          placeholder="Escriba para buscar..."
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          onSubmitEditing={onSubmitEditing}
          style={{
            height: 40,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            paddingHorizontal: 10,
            marginRight: 5,
          }}
          styleContainer={{
            width:"80%",
            height: 40,
            // borderWidth: 1,
            // borderColor: '#ccc',
            marginBottom:0
          }}
        />

        {/* Dropdown ocupa el 2.5% */}
        <Dropdown
          onSelect={(option) => setFilterField(`${option.value}`)}
          options={[
            { label: 'Descripción', value: 'description' },
            { label: 'Referencia', value: 'reference' },
            { label: 'Categoría', value: 'categoria' },
            { label: 'Unidad', value: 'unidad' },
            { label: 'Impuesto', value: 'tax' },
          ]}
          iconMode={true}
          style={{
            width: '10%', // Porcentaje del ancho del contenedor
            // height: 40,
            height: 40,
            // borderWidth: 1,
            // borderColor: '#ccc',
            // borderRadius: 5,
            justifyContent: 'center',
            // marginRight: 5,
          }}
        />

        {/* Botón ocupa el 2.5% */}
        <TouchableOpacity
          onPress={toggleViewStyle}
          style={{
            width: '10%', // Porcentaje del ancho del contenedor
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: 5,

            // borderWidth: 1,
            // borderColor: '#ccc',
          }}
        >
          <MaterialIcons
            name={viewStyle === 'list' ? 'view-module' : 'view-list'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
    </View>
  );
};


export default SearchBar;