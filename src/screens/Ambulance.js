import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { auth, db, realtimeDB } from "../../firebase"; // Ensure correct imports

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
  const mapRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAmbulanceId();
      requestLocation();
      fetchHospitals();
    }
  }, [isLoggedIn]);

  // 🔹 Authenticate user before fetching ambulance data
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }

    try {
      console.log("Attempting login for:", email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.email) {
        console.error("Error: User email is missing after login.");
        Alert.alert("Error", "Unable to retrieve user email.");
        return;
      }

      console.log("User authenticated:", user.email);

      setIsLoggedIn(true);
      fetchAmbulanceId(user.email); // ✅ Ensure email is passed correctly
    } catch (error) {
      console.error("Login Error:", error.message);
      Alert.alert("Error", "Invalid email or password. Please try again.");
    }
  };

  // 🔹 Fetch ambulance ID for the authenticated user
  const fetchAmbulanceId = async (email) => {
    try {
      if (!email) {
        email = auth.currentUser?.email; // ✅ Fallback to current authenticated user email
        if (!email) {
          Alert.alert("Error", "User email is missing.");
          return;
        }
      }

      console.log("Fetching ambulance ID for:", email);

      const userDoc = await getDoc(doc(db, "users", email));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data:", userData);

        if (userData.ambulanceId) {
          setAmbulanceId(userData.ambulanceId);
        } else {
          Alert.alert("Error", "Ambulance ID not found.");
        }
      } else {
        Alert.alert("Error", "User data not found in Firestore.");
      }
    } catch (error) {
      console.error("Fetch Ambulance ID Error:", error);
      Alert.alert("Error", "Failed to fetch ambulance ID.");
    }
  };

  // 🔹 Request and update user location in Firebase
  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permission denied. Enable location services.");
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 🔹 Updated to every 5 seconds (milliseconds would be too frequent)
          distanceInterval: 1,
        },
        async (userLocation) => {
          setLocation(userLocation.coords);
          updateFirebaseLocation(userLocation.coords);
          updateRealtimeDatabase(userLocation.coords);

          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        }
      );
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "Error fetching location.");
    }
  };

  // 🔹 Update location in Firestore
  const updateFirebaseLocation = async (coords) => {
    if (!ambulanceId) return;
    await setDoc(doc(db, "ambulances", ambulanceId), {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: Date.now(),
    });
  };

  // 🔹 Update location in Firebase Realtime Database
  const updateRealtimeDatabase = async (coords) => {
    if (!ambulanceId) return;
    await set(ref(realtimeDB, `ambulances/${ambulanceId}`), {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: Date.now(),
    });
  };

  // 🔹 Fetch nearby hospitals from Firestore
  const fetchHospitals = async () => {
    const [loading, setLoading] = useState(false);

    const fetchHospitals = async () => {
      setLoading(true); // Show loader
      try {
        const hospitalDocs = await getDocs(collection(db, "hospitals"));
        const hospitalList = hospitalDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHospitals(hospitalList);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false); // Hide loader
      }
    };
  };

  // 🔹 Calculate approximate distance between two coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {!isLoggedIn ? (
        <View>
          <Text
            style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}
          >
            🚑 Ambulance Login
          </Text>

          <TextInput
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={{ color: "white", fontSize: 18 }}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            🚑 Ambulance ID: {ambulanceId || "Loading..."}
          </Text>

          <MapView ref={mapRef} style={{ height: "50%" }}>
            {location && (
              <Marker
                coordinate={location}
                title="Your Location"
                pinColor="blue"
              />
            )}
          </MapView>

          {loading ? (
  <ActivityIndicator size="large" color="#007bff" style={{ margin: 20 }} />
) : (
  <FlatList
    data={hospitals}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.hospitalCard}>
        <Text style={styles.hospitalIcon}>🏥</Text>
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{item.name}</Text>
          <Text style={styles.hospitalDistance}>
            {location
              ? `${getDistance(
                  location.latitude,
                  location.longitude,
                  item.latitude,
                  item.longitude
                ).toFixed(2)} km away`
              : "Distance unknown"}
          </Text>
        </View>
      </View>
    )}
  />
)}

        </View>
      )}
    </View>
  );
};
const styles = {
  hospitalCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
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
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderColor: "#ccc",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loginContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007bff",
  },
  map: {
    height: "50%",
    borderRadius: 10,
    overflow: "hidden",
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#ffffff",
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
};

export default AmbulanceDashboard;
