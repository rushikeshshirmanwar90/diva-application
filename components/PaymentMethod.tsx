import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RadioButton } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";

const PaymentOptions = () => {
  const [selectedPayment, setSelectedPayment] = useState("cards");

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => setSelectedPayment("cards")}
      >
        <View style={styles.iconTextContainer}>
          <FontAwesome5 name="wallet" size={24} color="black" />
          <Text style={styles.optionText}>
            Cards, Wallet, Paypal, Netbanking
          </Text>
        </View>
        <RadioButton
          value="cards"
          status={selectedPayment === "cards" ? "checked" : "unchecked"}
          onPress={() => setSelectedPayment("cards")}
        />
      </TouchableOpacity>

      {/* Payment Option 2 */}
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => setSelectedPayment("cod")}
      >
        <View style={styles.iconTextContainer}>
          <FontAwesome5 name="money-bill-alt" size={24} color="black" />
          <Text style={styles.optionText}>Cash on Delivery</Text>
        </View>
        <RadioButton
          value="cod"
          status={selectedPayment === "cod" ? "checked" : "unchecked"}
          onPress={() => setSelectedPayment("cod")}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
});

export default PaymentOptions;
