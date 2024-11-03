import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"; // For icons
import { ReviewProps } from "../interface/reivew";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { domain } from "./route/route";

const ReviewCard: React.FC<{ productId: number }> = ({ productId }) => {
  const rating = 5; // This is the rating number

  const [review, setReview] = useState<ReviewProps[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {

    
    const fetchReviews = async () => {
      const reviews = await getReviews(productId);
      console.log(reviews.data);
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("@userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    };
    checkUser();
  }, []);

  const getReviews = async (productId: number) => {
    const res = await fetch(
      `${domain}/api/reviews/${userId}?populate=*&filters[$and][0][documentId][$eq]=${productId}`
    );
    const data = await res.json();
    return data;
  };

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
      {review.length > 0 ? (
        review.map((rev, index) => (
          <View key={index} style={styles.leftContainer}>
            <View style={styles.starContainer}>{renderStars()}</View>
            <Text style={styles.reviewText}>{rev.Description}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.reviewText}>
          There is no review for this product.
        </Text>
      )}

      {/* Right Side: Edit and Delete Icons */}
      {review.length > 0 && (
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
      )}
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