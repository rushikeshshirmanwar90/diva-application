import { Modal, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";

const Models: React.FC<{ showModal: boolean; modalMessage: string }> = ({
  showModal,
  modalMessage,
}) => {
  return (
    <View>
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Models;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },

  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});
