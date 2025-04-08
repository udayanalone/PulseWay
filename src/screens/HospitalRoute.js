  import React, { useEffect, useState } from "react";
  import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
  import MapView, { Marker, Polyline } from "react-native-maps";
  import * as Location from "expo-location";

  const HospitalRoute = ({ route }) => {
    const { hospital, ambulanceLocation } = route.params || {}; // Get hospital and ambulance location from navigation params
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchRoute = async () => {
        try {
          setLoading(true);

          if (!ambulanceLocation || !hospital || !hospital.latitude || !hospital.longitude) {
            throw new Error("Invalid ambulance or hospital location");
          }

          // Request location permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            throw new Error("Location permission not granted");
          }

          // Request route from OpenRouteService
          const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62481f0ee85b9e434016bc1221504956427e&start=${ambulanceLocation.longitude},${ambulanceLocation.latitude}&end=${hospital.longitude},${hospital.latitude}`;
          
          console.log("Requesting route from:", ambulanceLocation, "to", `Latitude: ${hospital.latitude}, Longitude: ${hospital.longitude}`);

          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();
          // console.log("API Response:", JSON.stringify(data, null, 2));

          if (!data.routes || data.routes.length === 0) {
            throw new Error("No route found.");
          }

          const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
            longitude: coord[0],
            latitude: coord[1],
          }));

          setRouteCoordinates(coordinates);
        } catch (error) {
          console.error("Error fetching route:", error);
          setError(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      if (ambulanceLocation && hospital) {
        fetchRoute();
      }
    }, [ambulanceLocation, hospital]);

    return (
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: ambulanceLocation.latitude,
              longitude: ambulanceLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={ambulanceLocation} title="Your Location" />
            {hospital && (
              <Marker
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                title={hospital.name}
              />
            )}
            <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="red" />
          </MapView>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
    },
  });

  export default HospitalRoute;
