import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import BackgroundWrapper from "../component/BackgroundWrapper";
import Button from "../component/Button"; // Assuming Button is a custom component
import Input from "../component/Input"; // Assuming Input is a custom component

const AmbulanceDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username: initialUsername, authType } = route.params || {};

  const [email, setEmail] = useState(initialUsername || "");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUsername);
  const [ambulanceId, setAmbulanceId] = useState(null);
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    let locationSubscription = null;
    if (isLoggedIn) {
      fetchAmbulanceId();
      const setupLocation = async () => {
        locationSubscription = await requestLocation();
      };
      setupLocation();
      fetchHospitals();
    }
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsLoggedIn(true);
      fetchAmbulanceId(user.email);
    } catch (error) {
      Alert.alert("Error", "Invalid email or password. Please try again.");
    }
  };

  const fetchAmbulanceId = async (email) => {
    try {
      if (!email) {
        email = auth.currentUser?.email;
        if (!email) {
          Alert.alert("Error", "User email is missing.");
          return;
        }
      }

      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.ambulanceId) {
          setAmbulanceId(userData.ambulanceId);
        } else {
          Alert.alert("Error", "Ambulance ID not found.");
        }
      } else {
        Alert.alert("Error", "User data not found in Firestore.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch ambulance ID.");
    }
  };

  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permission denied. Enable location services.");
        return null;
      }

      const initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation.coords);
      await updateFirebaseLocation(initialLocation.coords);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 1,
        },
        async (userLocation) => {
          setLocation(userLocation.coords);
          await updateFirebaseLocation(userLocation.coords).catch(console.error);
        }
      );
      return subscription;
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Error fetching location. Please check your location settings.");
      return null;
    }
  };

  const updateFirebaseLocation = async (coords) => {
    if (!ambulanceId) return;
    try {
      await setDoc(
        doc(db, "ambulances", ambulanceId),
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Update Firebase error:", error);
    }
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const hospitalDocs = await getDocs(collection(db, "hospitals"));
      const hospitalList = hospitalDocs.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.id,
          ...doc.data(),
        }))
        .filter(
          (hospital) =>
            hospital.location &&
            hospital.location.latitude &&
            hospital.location.longitude
        );
      setHospitals(hospitalList);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch hospitals.");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = async (hospital) => {
    try {
      const hospitalName = hospital.name.trim();
      const hospitalRef = doc(db, "hopamblink", hospitalName);
      const hospitalDoc = await getDoc(hospitalRef);

      const fullAmbulanceData = {
        ambulanceId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          altitudeAccuracy: location.altitudeAccuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp || Date.now(),
        },
      };

      if (!hospitalDoc.exists()) {
        await setDoc(hospitalRef, {
          name: hospitalName,
          ambulances: [fullAmbulanceData],
        });
        Alert.alert("Success", "New hospital created and ambulance added.");
      } else {
        const hospitalData = hospitalDoc.data();
        const existingAmbulances = hospitalData.ambulances || [];

        const index = existingAmbulances.findIndex(
          (amb) => amb.ambulanceId === ambulanceId
        );

        if (index !== -1) {
          existingAmbulances[index] = fullAmbulanceData;
        } else {
          existingAmbulances.push(fullAmbulanceData);
        }

        await updateDoc(hospitalRef, {
          ambulances: existingAmbulances,
        });

        Alert.alert("Success", "Ambulance data updated.");
      }
    } catch (error) {
      console.error("Hospital save error:", error);
      Alert.alert("Error", "Something went wrong while saving ambulance data.");
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        {!isLoggedIn ? (
          <View style={styles.loginContainer}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
              🚑 Ambulance Login
            </Text>

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
            <Button
  title="Login"
  onPress={handleLogin}
  gradientColors={[""]}
/>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 15 }}>
              🚑 Ambulance ID: {ambulanceId || "Loading..."}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2196F3",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  loginContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderColor: "#ccc",
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    height: "30%", // Map covers 30% of the screen height
    borderRadius: 15,
    margin: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden", // Ensures the map stays within the rounded corners
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
    marginBottom: 5,
  },
  map: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  hospitalCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  hospitalIcon: {
    fontSize: 24,
    color: "#007bff",
    marginRight: 10,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  hospitalDistance: {
    fontSize: 14,
    color: "#666",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerButton: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
  },
  footerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AmbulanceDashboard;
