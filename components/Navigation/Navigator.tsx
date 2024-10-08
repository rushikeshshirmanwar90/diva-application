import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/Home";
import Details from "../../screens/Details";
import CartScreen from "../../screens/Cart2";
import CategoryDetail from "../../screens/CategoryDetail";
import AddressForm from "../../screens/Checkout";
import Checkout from "../../screens/Checkout";
import LoginSignupScreen from "../../screens/Login";
import RegistrationScreen from "../../screens/Register";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="Login" component={LoginSignupScreen} />

        <Stack.Screen
          name="DIVA"
          component={Home}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen name="My Cart" component={CartScreen} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Category Detail" component={CategoryDetail} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="User Address" component={AddressForm} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;