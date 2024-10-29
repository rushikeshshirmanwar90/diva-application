import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import Home from "../../screens/Home";
import Details from "../../screens/Details";
import CartScreen from "../../screens/Cart2";
import CategoryDetail from "../../screens/CategoryDetail";
import AddressForm from "../../screens/Checkout";
import Checkout from "../../screens/Checkout";
import LoginSignupScreen from "../../screens/Login";
import RegistrationScreen from "../../screens/Register";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginSignupScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen
          name="DIVA"
          component={Home}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen name="My Cart" component={CartScreen} />
        <Stack.Screen
          name="Details"
          component={Details}
          options={({ navigation }) => ({
            headerRight: () => (
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("My Cart");
                  }}
                >
                  <Image
                    source={require("../../assets/images/bag-2.png")}
                    style={{ width: 16, height: 20 }}
                  />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen name="Category Detail" component={CategoryDetail} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="User Address" component={AddressForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
