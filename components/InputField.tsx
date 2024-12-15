
import {TextInput, StyleSheet, View, Text} from 'react-native'

interface TextInputFieldInterface {
    value: string;
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
        ...otherProps
    } = props

    return (
        <View style={styles.container}>
          <TextInput
            style={[styles.input, error ? styles.errorInput : {}, style]}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={value}
            onChangeText={onChangeText}
            {...otherProps}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );

    return (
        <TextInput
        style={[styles.input, {...style}]}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        {...otherProps}
      />
    )
}


// const styles = StyleSheet.create({
//     input: {
//         height: 35,
//         borderColor: '#ddd',
//         borderWidth: 1,
//         borderRadius: 12,
//         paddingHorizontal: 10,
//         marginBottom: 10,
//         backgroundColor: '#fff',
//     },
// });


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