import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { auth, db, rtdb } from "../../firebase";

const HospitalSignup = ({ navigation }) => {
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // 📌 Try to fetch current location on load
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permission denied. You can enter location manually.");
          setLoadingLocation(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude.toString());
        setLongitude(loc.coords.longitude.toString());
      } catch (err) {
        setLocationError("Unable to fetch location. Enter it manually.");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const handleSignup = async () => {
    if (!hospitalName || !email || !password || !latitude || !longitude) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
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

      Alert.alert("Success", "Hospital Registered!");
      navigation.navigate("Hospital", { hospitalName });
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>🏥 Hospital Signup</Text>

      <TextInput placeholder="Hospital Name" value={hospitalName} onChangeText={setHospitalName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

      {loadingLocation ? (
        <ActivityIndicator size="small" color="blue" />
      ) : (
        <>
          {locationError && <Text style={{ color: "red", marginBottom: 5 }}>{locationError}</Text>}
          <TextInput
            placeholder="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            style={styles.input}
            keyboardType="numeric"
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={{ color: "white", fontSize: 18 }}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
};

export default HospitalSignup;
