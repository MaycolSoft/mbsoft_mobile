
import {TextInput, StyleSheet} from 'react-native'

interface TextInputFieldInterface {
    value: string;
    onChangeText?: (text: string) => void;
    placeholder: string;
    [key:string]: any;
}

const TextInputField = (props:TextInputFieldInterface) => {
    const {
        value,
        onChangeText = ()=>{},
        placeholder,
        ...otherProps
    } = props

    return (
        <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        {...otherProps}
      />
    )
}


const styles = StyleSheet.create({
    input: {
        height: 35,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
})



export default TextInputField