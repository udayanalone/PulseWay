const OPENROUTE_API_KEY = "5b3ce3597851110001cf62481f0ee85b9e434016bc1221504956427e";

export const getDirections = async (startLat, startLng, endLat, endLng) => {
  try {
    // Dynamically construct the URL using the provided coordinates
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${startLng},${startLat}&end=${endLng},${startLat}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found.");
    }

    return data.routes[0].geometry.coordinates.map(coord => ({
      longitude: coord[0],
      latitude: coord[1],
    }));
  } catch (error) {
    console.error("Error fetching directions:", error);
    throw error;
  }
};
