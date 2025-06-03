import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const HospitalDashboardNEW = () => {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitalSuggestions, setHospitalSuggestions] = useState([]);
  const [hospitalLocations, setHospitalLocations] = useState({});

  useEffect(() => {
    fetchHospitalSuggestions();
  }, []);

  const fetchHospitalSuggestions = async () => {
    try {
      const hospitalDocs = await getDocs(collection(db, "hospitals"));
      const hospitalNames = hospitalDocs.docs.map((doc) => doc.id);
      setHospitalSuggestions(hospitalNames);
      const locations = {};
      hospitalDocs.docs.forEach((doc) => {
        const data = doc.data();
        if (data.location) {
          locations[doc.id] = data.location;
        }
      });
      setHospitalLocations(locations);
    } catch (error) {
      console.error("Error fetching hospital suggestions:", error);
      Alert.alert("Error", "Failed to fetch hospital suggestions.");
    }
  };

  const fetchHospitalDetails = async () => {
    const HospitalName = hospitalName.trim();

    setLoading(true);
    try {
      const hospitalRef = doc(db, "hopamblink", HospitalName);
      const hospitalDoc = await getDoc(hospitalRef);

      if (!hospitalDoc.exists()) {
        Alert.alert("Info", "No ambulance approaching this hospital yet.");
        setHospitalDetails(null);
        setAmbulances([]);
      } else {
        const hospitalData = hospitalDoc.data();
        setHospitalDetails(hospitalData);

        const selectedHospitalLocation = hospitalLocations[HospitalName];
        if (hospitalData.ambulances && hospitalData.ambulances.length > 0) {
          const updatedAmbulances = hospitalData.ambulances.map((ambulance) => {
            const distance =
              selectedHospitalLocation?.latitude &&
              selectedHospitalLocation?.longitude &&
              ambulance.location?.latitude &&
              ambulance.location?.longitude
                ? getDistance(
                    selectedHospitalLocation.latitude,
                    selectedHospitalLocation.longitude,
                    ambulance.location.latitude,
                    ambulance.location.longitude
                  )
                : "Unknown";
            return {
              ...ambulance,
              distance: distance !== "Unknown" ? distance.toFixed(2) : distance,
            };
          });

          setAmbulances(updatedAmbulances);
        } else {
          setAmbulances([]);
        }
      }
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      Alert.alert("Error", "Failed to fetch hospital details. Please try again.");
    } finally {
      setLoading(false);
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

  const handleDeleteAmbulance = async (ambulanceId) => {
    if (!hospitalName.trim()) return;
    try {
      setLoading(true);
      const hospitalRef = doc(db, "hopamblink", hospitalName.trim());
      const hospitalDoc = await getDoc(hospitalRef);
      if (!hospitalDoc.exists()) {
        Alert.alert("Error", "Hospital not found in Firestore.");
        setLoading(false);
        return;
      }
      const hospitalData = hospitalDoc.data();
      const updatedAmbulances = (hospitalData.ambulances || []).filter(
        (amb) => amb.ambulanceId !== ambulanceId
      );
      await updateDoc(hospitalRef, { ambulances: updatedAmbulances });
      fetchHospitalDetails(); // Reload list
    } catch (error) {
      console.error("Error deleting ambulance:", error);
      Alert.alert("Error", "Failed to delete ambulance.");
    } finally {
      setLoading(false);
    }
  };

  const renderHospitalSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => setHospitalName(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderAmbulanceItem = ({ item }) => (
    <View style={styles.ambulanceItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ambulanceText}>🚑 Ambulance ID: {item.ambulanceId}</Text>
        <Text style={styles.ambulanceText}>
          📍 Distance: {item.distance !== "Unknown" ? `${item.distance} KM` : "Unknown"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            "Delete Ambulance",
            "Are you sure you want to delete this ambulance?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => handleDeleteAmbulance(item.ambulanceId) },
            ]
          )
        }
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏥 Hospital Dashboard</Text>

      <TextInput
        placeholder="Enter Hospital Name"
        value={hospitalName}
        onChangeText={setHospitalName}
        style={styles.input}
      />

      {hospitalSuggestions.length > 0 && hospitalName.trim() !== "" && (
        <FlatList
          data={hospitalSuggestions.filter((name) =>
            name.toLowerCase().includes(hospitalName.toLowerCase())
          )}
          renderItem={renderHospitalSuggestion}
          keyExtractor={(item) => item}
          style={styles.suggestionsList}
        />
      )}

      <TouchableOpacity style={styles.searchButton} onPress={fetchHospitalDetails}>
        <Text style={styles.searchButtonText}>Search Hospital</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : hospitalDetails ? (
        <View style={styles.hospitalDetails}>
          <Text style={styles.hospitalName}>{hospitalDetails.name}</Text>
          <Text style={styles.hospitalLocation}>
            📍 Location:{" "}
            {hospitalDetails.location?.latitude && hospitalDetails.location?.longitude
              ? `${hospitalDetails.location.latitude}, ${hospitalDetails.location.longitude}`
              : "Unknown"}
          </Text>

          <Text style={styles.sectionTitle}>Ambulances</Text>
          {ambulances.length > 0 ? (
            <FlatList
              data={ambulances}
              renderItem={renderAmbulanceItem}
              keyExtractor={(item) => item.ambulanceId}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.noDataText}>No ambulances found for this hospital.</Text>
          )}
        </View>
      ) : (
        <Text style={styles.noDataText}>Enter a hospital name to view details.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  hospitalDetails: {
    marginTop: 16,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  hospitalLocation: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 16,
  },
  ambulanceItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  ambulanceText: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HospitalDashboardNEW;