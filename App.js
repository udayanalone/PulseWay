import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AmbulanceDashboard from './src/screens/Ambulance';
import HospitalDashboard from './src/screens/Hospital';
import HospitalDashboardNEW from './src/screens/HospitalDashboard';
import HospitalRoute from './src/screens/HospitalRoute';
import IndexScreen from './src/screens/IndexScreen';
import HospitalSignup from './src/forms/HospitalForm';
import AmbulanceSignup from './src/forms/AmbulanceForm';

const Stack = createNativeStackNavigator();

export default function App() {
  // Define global header styles
  const globalScreenOptions = {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTitle: "PulseWay",
    headerStyle: {
      backgroundColor: "rgb(0, 123, 255)", // RGB color for header background
    },
    headerTitleStyle: {
      color: "rgb(255, 255, 255)", // RGB color for header title text
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index" screenOptions={globalScreenOptions}>
        <Stack.Screen name="Hospital_Dashboard" component={HospitalDashboardNEW} />
        <Stack.Screen name="Index" component={IndexScreen} />
        <Stack.Screen name="hospital_signup" component={HospitalSignup} />
        <Stack.Screen name="ambulance_signup" component={AmbulanceSignup} />
        <Stack.Screen name="HospitalRoute" component={HospitalRoute} />
        <Stack.Screen name="AmbulanceDashboard" component={AmbulanceDashboard} />
        <Stack.Screen name="Hospital" component={HospitalDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}