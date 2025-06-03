import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Button = ({ title, onPress, gradientColors = ["#4fc3f7", "#0288d1"] }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <Text style={styles.text}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  gradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Button;