import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AmbulanceDashboard from "./src/screens/Ambulance";
import HospitalDashboardNEW from "./src/screens/HospitalDashboard";
import IndexScreen from "./src/screens/IndexScreen";
import HospitalSignup from "./src/forms/HospitalForm";
import AmbulanceSignup from "./src/forms/AmbulanceForm";

const Stack = createNativeStackNavigator();

const globalScreenOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTitle: "PulseWay",
  headerStyle: {
    backgroundColor: "rgb(0, 123, 255)",
  },
  headerTitleStyle: {
    color: "rgb(255, 255, 255)",
  },
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index" screenOptions={globalScreenOptions}>
        <Stack.Screen name="Index" component={IndexScreen} />
        <Stack.Screen name="Hospital_Dashboard" component={HospitalDashboardNEW} />
        <Stack.Screen name="hospital_signup" component={HospitalSignup} />
        <Stack.Screen name="ambulance_signup" component={AmbulanceSignup} />
        <Stack.Screen name="AmbulanceDashboard" component={AmbulanceDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}