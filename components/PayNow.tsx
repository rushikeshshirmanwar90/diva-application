import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // For the lock icon

const PaymentButton = () => {
  return (
    <View style={styles.container}>
      {/* Price Text */}
      <Text style={styles.priceText}>₹4495</Text>

      {/* Pay Now Button */}
      <TouchableOpacity style={styles.payButton}>
        <FontAwesome name="lock" size={20} color="white" />
        <Text style={styles.payText}>PAY NOW</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "600",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B81",
    width: 200,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  payText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    textAlign: "center",
  },
});

export default PaymentButton;
