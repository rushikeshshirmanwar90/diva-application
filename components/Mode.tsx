import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; 

const ReviewModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <FontAwesome
            name={i <= rating ? "star" : "star-o"}
            size={30}
            color={i <= rating ? "#FFD700" : "#CED4DA"}
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const submitReview = () => {
    console.log("Review Submitted:", { rating, reviewText });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Button to open the review modal */}
      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Write Your Review</Text>
      </TouchableOpacity>

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button (X icon) */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <FontAwesome name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Review</Text>

            {/* Custom Star Rating Component */}
            <View style={styles.starContainer}>{renderStars()}</View>

            {/* Text Input for Review */}
            <TextInput
              style={styles.input}
              placeholder="Write your review"
              multiline
              numberOfLines={4}
              onChangeText={(text) => setReviewText(text)}
              value={reviewText}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitReview}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  reviewButton: {
    backgroundColor: "#1D3557",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: "row",
    marginVertical: 15,
  },
  input: {
    width: "100%",
    height: 100,
    borderColor: "#CED4DA",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#1D3557",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default ReviewModal;