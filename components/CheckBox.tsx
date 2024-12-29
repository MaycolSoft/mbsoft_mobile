import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


interface CheckBoxProps {
  remember: boolean;
  setRemember: (value: boolean) => void;
  disabled?: boolean;
}

const CheckBox = (props:CheckBoxProps) => {
  return (
    <View style={styles.rememberContainer}>
      <TouchableOpacity
        style={[styles.checkbox, props.remember ? styles.checkboxSelected : null]}
        onPress={() => props.setRemember(!props.remember)}
        disabled={props?.disabled}
      >
        {props.remember && <Text style={styles.checkmark}>✔</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rememberContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
  },
});

export default CheckBox;
