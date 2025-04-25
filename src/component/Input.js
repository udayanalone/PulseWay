// filepath: src/component/Input.js
import React from "react";
import { TextInput, StyleSheet } from "react-native";

const Input = ({ placeholder, value, onChangeText, keyboardType = "default", secureTextEntry = false }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
    secureTextEntry={secureTextEntry}
    placeholderTextColor="#666"
  />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
  },
});

export default Input;