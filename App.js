import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import GreetingScreen from "./components/Logistic.js"; // Adjust the path as needed
import FlightUpdateScreen from "./components/Airport.js";
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GreetingScreen">
        <Stack.Screen
          name="GreetingScreen"
          component={GreetingScreen}
          options={{ headerShown: false }}
        />
        {
          <Stack.Screen
            name="FlightUpdateScreen"
            component={FlightUpdateScreen}
            options={{ headerShown: false }}
          />
          /* <Stack.Screen name="Login" component={Login}options={{headerShown:false}} />

        <Stack.Screen name="CreateUser" component={CreateUser}options={{headerShown:false}} />
        <Stack.Screen name="forgetPassword" component={forgetPassword}options={{headerShown:false}} /> */
        }
        {/* <Stack.Screen name="MapComponent" component={MapComponent}options={{headerShown:false}} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
