import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const HospitalDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    hospitalName: initialHospitalName,
    latitude: initialLatitude,
    longitude: initialLongitude,
  } = route.params || {};

  const [hospitalName, setHospitalName] = useState(initialHospitalName || "");
  const [location, setLocation] = useState(null);
  const [latitude, setLatitude] = useState(initialLatitude || "");
  const [longitude, setLongitude] = useState(initialLongitude || "");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(
    !initialLatitude && !initialLongitude
  );

  useEffect(() => {
    if (useCurrentLocation) {
      fetchCurrentLocation();
    }
  }, [useCurrentLocation]);

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission denied. Enable location services.");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    } catch (error) {
      setLocationError("Error fetching location. Try again.");
    }
  };

  const saveHospital = async () => {
    if (!hospitalName || (!location && (useCurrentLocation || !latitude || !longitude))) {
      Alert.alert("Error", "Enter hospital name and provide a valid location.");
      return;
    }

    setLoading(true);
    try {
      const hospitalLocation = useCurrentLocation
        ? location
        : { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

      await addDoc(collection(db, "hopamblink"), {
        name: hospitalName,
        location: hospitalLocation,
      });

      Alert.alert("Success", "Hospital added successfully!");

      navigation.navigate("HospitalDashboardNEW", {
        hospitalName,
        latitude: hospitalLocation.latitude,
        longitude: hospitalLocation.longitude,
      });

      setHospitalName("");
      setLatitude("");
      setLongitude("");
    } catch (error) {
      console.error("Error saving hospital:", error); // Log the error
      Alert.alert("Error", "Could not add hospital. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#e0f7fa", "#80deea"]} style={styles.container}>
      <Text style={styles.title}>🏥 Hospital Dashboard</Text>

      <TextInput
        placeholder="Enter Hospital Name"
        value={hospitalName}
        onChangeText={setHospitalName}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setUseCurrentLocation(!useCurrentLocation)}
      >
        <Text style={styles.toggleText}>
          {useCurrentLocation ? "Switch to Manual Location" : "Use Current Location"}
        </Text>
      </TouchableOpacity>

      {useCurrentLocation ? (
        locationError ? (
          <Text style={styles.errorText}>{locationError}</Text>
        ) : location ? (
          <Text style={styles.locationText}>
            📍 Location: {location.latitude}, {location.longitude}
          </Text>
        ) : (
          <ActivityIndicator size="small" color="blue" />
        )
      ) : (
        <>
          <TextInput
            placeholder="Enter Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Enter Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            style={styles.input}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveHospital}
        disabled={loading}
      >
        <Text style={styles.saveText}>{loading ? "Saving..." : "Save Hospital"}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: "white",
    borderColor: "#bbb",
  },
  toggleButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
  },
  locationText: {
    marginBottom: 10,
    fontStyle: "italic",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HospitalDashboard;