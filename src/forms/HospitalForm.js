import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, set, get } from "firebase/database";
import { auth, db, rtdb } from "../../firebase";
import Input from "../component/Input"; // Assuming Input is a custom component

const HospitalSignup = ({ navigation }) => {
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingSignup, setLoadingSignup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permission denied. Enter location manually.");
          setLoadingLocation(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude.toString());
        setLongitude(loc.coords.longitude.toString());
      } catch (err) {
        setLocationError("Unable to fetch location. Enter manually.");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberRegex = /^-?\d+(\.\d+)?$/;

    if (!hospitalName || !email || !password || !latitude || !longitude) {
      Alert.alert("Error", "All fields are required!");
      return false;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    if (!numberRegex.test(latitude) || !numberRegex.test(longitude)) {
      Alert.alert("Invalid Location", "Latitude and Longitude must be valid numbers.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoadingSignup(true);

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        Alert.alert("Email Exists", "Please use a different email.");
        setLoadingSignup(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, "hospitals", hospitalName), {
        userId,
        hospitalName,
        email,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });

      await set(ref(rtdb, `hospitals/${hospitalName}`), {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: "active",
      });

      Alert.alert("Success", "Hospital Registered Successfully!");
      navigation.navigate("Hospital", { hospitalName });
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoadingSignup(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🏥 Hospital Signup</Text>

      {locationError && <Text style={styles.errorText}>{locationError}</Text>}
      {loadingLocation && <ActivityIndicator size="small" color="blue" />}

      <Input
        placeholder="Hospital Name"
        value={hospitalName}
        onChangeText={setHospitalName}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <Input
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <Button
        title={loadingSignup ? "Signing Up..." : "Sign Up"}
        onPress={handleSignup}
        gradientColors={["#4caf50", "#388e3c"]}
        disabled={loadingSignup}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default HospitalSignup;
