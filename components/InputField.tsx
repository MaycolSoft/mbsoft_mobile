
import {TextInput, StyleSheet, View, Text} from 'react-native'
import useStore from '@/store/useStore';


interface TextInputFieldInterface {
    value: string|number;
    onChangeText?: (text: string) => void;
    placeholder: string;
    error?: string;
    [key:string]: any;
}

const TextInputField = (props:TextInputFieldInterface) => {
  const {
      value,
      onChangeText = ()=>{},
      placeholder,
      error,
      style={},
      styleContainer={},
      ...otherProps
  } = props
  
  const { config } = useStore();
  const dynamicStyles = {
    input: {
      ...styles.input,
      color: config.darkMode ? '#fff' : 'black',
      backgroundColor: config.darkMode ? '#333' : '#fff',
    },
  };

  return (
    <View style={[styles.container, {...styleContainer}]}>
      <TextInput
        style={[dynamicStyles.input, error ? styles.errorInput : {}]}
        placeholder={placeholder}
        placeholderTextColor={config.darkMode ? '#888' : 'black'}
        value={value?`${value}`:undefined}
        onChangeText={onChangeText}
        {...otherProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      marginBottom: 10,
    },
    input: {
      height: 35,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      backgroundColor: '#fff',
    },
    errorInput: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
  });



export default TextInputField