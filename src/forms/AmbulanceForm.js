import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { auth, db, rtdb } from "../../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const generateAmbulanceId = () => "AMB" + Math.floor(100000 + Math.random() * 900000);

const AmbulanceSignup = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }

    try {
      // 🔹 Firebase Authentication Signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const ambulanceId = generateAmbulanceId();

      // 🔹 Store user data in Firestore
      await setDoc(doc(db, "users", email), { userId, email, ambulanceId });

      // 🔹 Store ambulance details in Realtime Database
      await set(ref(rtdb, `ambulances/${userId}`), { ambulanceId, status: "active" });

      Alert.alert("Success", "Ambulance Registered!");
      navigation.navigate("AmbulanceDashboard", { email });

    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#4fc3f7", "#0288d1"]}
      style={styles.gradientBackground}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>🚑 Ambulance Signup</Text>

        <View style={{ position: "relative" }}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholderTextColor="#666"
          />
          <MaterialIcons name="email" style={styles.inputIcon} />
        </View>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <LinearGradient colors={["#4fc3f7", "#0288d1"]} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    width: "100%",
    maxWidth: 400, // Mobile-friendly width
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    padding: 12,
    paddingLeft: 40, // Add padding for icons
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 10,
    top: 12,
    fontSize: 20,
    color: "#666",
  },
  button: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    color: "#0288d1",
    fontWeight: "bold",
  },
});

export default AmbulanceSignup;
