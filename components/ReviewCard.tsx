import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"; // For icons

const ReviewCard = () => {
  const rating = 5; // This is the rating number
  const reviewText = "Nice Product";

  // Render stars based on rating
  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={20}
          color="#FFD700" // Yellow for filled stars
          style={{ marginHorizontal: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Left Side: Rating and Review Text */}
      <View style={styles.leftContainer}>
        <View style={styles.starContainer}>{renderStars()}</View>
        <Text style={styles.reviewText}>{reviewText}</Text>
      </View>

      {/* Right Side: Edit and Delete Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "red" }]}
        >
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 10,
  },
  leftContainer: {
    flexDirection: "column",
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 16,
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#EAB308", // Orange for edit
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default ReviewCard;
