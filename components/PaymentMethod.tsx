import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RadioButton } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";

interface PaymentOptionsProps {
  onPaymentMethodChange: (method: string) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onPaymentMethodChange }) => {
  const [selectedPayment, setSelectedPayment] = useState("cards");

  const handlePaymentChange = (method: string) => {
    setSelectedPayment(method);
    onPaymentMethodChange(method);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => handlePaymentChange("cards")}
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
          onPress={() => handlePaymentChange("cards")}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => handlePaymentChange("cod")}
      >
        <View style={styles.iconTextContainer}>
          <FontAwesome5 name="money-bill-alt" size={24} color="black" />
          <Text style={styles.optionText}>Cash on Delivery</Text>
        </View>
        <RadioButton
          value="cod"
          status={selectedPayment === "cod" ? "checked" : "unchecked"}
          onPress={() => handlePaymentChange("cod")}
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
