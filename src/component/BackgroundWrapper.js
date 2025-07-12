import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BackgroundWrapper = ({ children }) => (
  <LinearGradient
    colors={["#e0f7fa", "#fff"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.container}
  >
    <View style={styles.content}>{children}</View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
});

export default BackgroundWrapper;