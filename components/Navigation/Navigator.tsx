import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/Home";
import Details from "../../screens/Details";
import Cart from "../../screens/Cart";
import CartScreen from "../../screens/Cart2";
import CategoryDetail from "../../screens/CategoryDetail";
import AddressForm from "../../screens/Checkout";
import Checkout from "../../screens/Checkout";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="Cart2" component={CartScreen} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="User Address" component={AddressForm} />
        <Stack.Screen name="Category Detail" component={CategoryDetail} />
        <Stack.Screen name="DIVA" component={Home} />
        <Stack.Screen name="Details" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;

const styles = StyleSheet.create({});