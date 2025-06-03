import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { auth, db, rtdb } from "../../firebase";

const generateAmbulanceId = () => "AMB" + Math.floor(100000 + Math.random() * 900000);

const AmbulanceSignup = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const ambulanceId = generateAmbulanceId();

      await setDoc(doc(db, "users", email.trim().toLowerCase()), { userId, email, ambulanceId });
      await set(ref(rtdb, `ambulances/${userId}`), { ambulanceId, status: "active" });

      Alert.alert("Success", "Ambulance Registered!");
      navigation.navigate("AmbulanceDashboard", { email });
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        </View>
        <View>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#666"
        />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    padding: 12,
    paddingLeft: 40,
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    position: "relative",
  },
  button: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#0288d1",
    alignItems: "center",
    padding: 14,
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
