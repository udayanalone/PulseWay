import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import Button from "../component/Button";
import Input from "../component/Input";

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

const AmbulanceDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username: initialUsername } = route.params || {};

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
      fetchAmbulanceId().then(() => {
        requestLocation().then((sub) => {
          locationSubscription = sub;
        });
        fetchHospitals();
      });
    }
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      fetchAmbulanceId(userCredential.user.email);
    } catch (error) {
      Alert.alert("Error", "Invalid email or password. Please try again.");
    }
  };

  const fetchAmbulanceId = async (emailParam) => {
    try {
      let emailToUse = (emailParam || email || auth.currentUser?.email || "").trim().toLowerCase();
      if (!emailToUse) {
        Alert.alert("Error", "User email is missing.");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", emailToUse));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.ambulanceId) setAmbulanceId(userData.ambulanceId);
        else Alert.alert("Error", "Ambulance ID not found in user data.");
      } else {
        Alert.alert("Error", `User data not found in Firestore for email: ${emailToUse}`);
      }
    } catch (error) {
      console.error("Failed to fetch ambulance ID:", error);
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
          location: doc.data().location,
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

  const sortedHospitals = location
    ? hospitals
        .map((hospital) => ({
          ...hospital,
          distance: getDistance(
            location.latitude,
            location.longitude,
            hospital.location.latitude,
            hospital.location.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : hospitals;

  const informHospital = async (hospital) => {
    if (!hospital?.id) {
      Alert.alert("Error", "Hospital information is missing.");
      return;
    }
    if (!ambulanceId) {
      Alert.alert("Error", "Ambulance ID missing.");
      return;
    }
    try {
      const ambDoc = await getDoc(doc(db, "ambulances", ambulanceId));
      if (!ambDoc.exists()) {
        Alert.alert("Error", "Ambulance data not found in Firestore.");
        return;
      }
      const ambData = ambDoc.data();

      const hospitalRef = doc(db, "hopamblink", hospital.id);
      const hospitalDoc = await getDoc(hospitalRef);

      let newAmbulance = {
        ambulanceId,
        location: ambData,
      };

      if (hospitalDoc.exists()) {
        const data = hospitalDoc.data();
        let ambulances = Array.isArray(data.ambulances) ? data.ambulances : [];
        ambulances.push(newAmbulance);
        await updateDoc(hospitalRef, { ambulances });
      } else {
        await setDoc(hospitalRef, {
          ambulances: [newAmbulance],
          location: hospital.location,
          name: hospital.name,
        });
      }
      Alert.alert("Success", "Ambulance informed to hospital!");
    } catch (error) {
      console.error("Error informing hospital:", error);
      Alert.alert("Error", "Failed to inform hospital.");
    }
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
              gradientColors={["#4fc3f7", "#0288d1"]}
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 15 }}>
              🚑 Ambulance ID: {ambulanceId || "Loading..."}
            </Text>
            {location ? (
              <View style={styles.mapContainer}>
                <Text style={styles.mapTitle}>Your Current Location</Text>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  showsUserLocation
                >
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Ambulance"
                    description="Your current location"
                  />
                  {sortedHospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      coordinate={{
                        latitude: hospital.location.latitude,
                        longitude: hospital.location.longitude,
                      }}
                      title={hospital.name}
                      description={`Distance: ${hospital.distance?.toFixed(2) ?? "?"} km`}
                      pinColor="blue"
                    />
                  ))}
                </MapView>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
            )}
            <Text style={styles.mapTitle}>Nearby Hospitals</Text>
            <FlatList
              data={sortedHospitals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.hospitalCard}>
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{item.name}</Text>
                    <Text style={styles.hospitalDistance}>
                      {item.distance !== undefined
                        ? `${item.distance.toFixed(2)} km away`
                        : "Distance unknown"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.informButton}
                    onPress={() => {
                      Alert.alert(
                        "Inform Hospital",
                        `Are you sure you want to inform ${item.name}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Inform",
                            style: "default",
                            onPress: () => informHospital(item),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.informButtonText}>Inform</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: "#888", marginTop: 10 }}>
                  No hospitals found nearby.
                </Text>
              }
            />
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
  mapContainer: {
    height: 250,
    borderRadius: 15,
    margin: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
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
  informButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  informButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AmbulanceDashboard;
