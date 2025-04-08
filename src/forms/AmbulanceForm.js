import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { auth, db, rtdb } from "../../firebase";

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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>🚑 Ambulance Signup</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={{ color: "white", fontSize: 18 }}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginVertical: 8, borderRadius: 5 },
  button: { backgroundColor: "blue", padding: 12, alignItems: "center", borderRadius: 5, marginTop: 10 },
};

export default AmbulanceSignup;
