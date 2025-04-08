import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AmbulanceDashboard from './src/screens/Ambulance';
import HospitalDashboard from './src/screens/Hospital';
import HospitalRoute from './src/screens/HospitalRoute';
import IndexScreen from './src/screens/IndexScreen';
import HospitalSignup from './src/forms/HospitalForm';
import AmbulanceSignup from './src/forms/AmbulanceForm';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={IndexScreen} 
        options={
          {
            headerShown: true,
            headerBackTitleVisible: false,
            headerTitle: "ZatPat",
            headerStyle: {
              backgroundColor: "rgb(0, 123, 255)", // RGB color for header background
            },
            headerTitleStyle: {
              color: "rgb(255, 255, 255)", // RGB color for header title text
            },
          }
        }/>
        <Stack.Screen name="hospital_signup" component={HospitalSignup}/>
        <Stack.Screen name='ambulance_signup' component={AmbulanceSignup} />
        <Stack.Screen name="HospitalRoute" component={HospitalRoute} />
        <Stack.Screen name="AmbulanceDashboard" component={AmbulanceDashboard} />
        <Stack.Screen name="Hospital" component={HospitalDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}