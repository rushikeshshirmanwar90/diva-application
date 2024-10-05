import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { domain } from "../components/route/route";

const RegistrationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const validateEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      // Email validation
      if (!validateEmail(email)) {
        setModalMessage("Please enter a valid email address.");
        setShowModal(true);
        setTimeout(() => setShowModal(false), 5000);
        return;
      }

      // Prepare the data for the backend API
      const userData = {
        fullName,
        email,
        password,
      };

      // Send request to the backend API
      const response = await fetch(
        `${domain}/api/user-ids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: userData }),
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const result = await response.json();

      // Check if user already exists
      if (result.error && result.error.message.includes("already exists")) {
        setModalMessage(
          "User already exists. Please try with a different email."
        );
        setShowModal(true);
        setTimeout(() => setShowModal(false), 5000);
        return;
      }

      // Store the returned ID in AsyncStorage
      await AsyncStorage.setItem("@userId", String(result.data.id));

      // Navigate to the next screen or show success message
      Alert.alert("Success", "Registration successful!", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      navigation.replace("Home");
    } catch (error: any) {
      console.error("Error registering user:", error.message);
      setModalMessage(
        "An error occurred during registration. Please try again."
      );
      setShowModal(true);
      setTimeout(() => setShowModal(false), 5000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DIVA</Text>
      <Text style={styles.title}>Register To DIVA</Text>

      <View style={styles.form}>
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={setFullName}
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={fullName}
            placeholder="Enter Full Name"
          />
        </View>

        <View style={styles.input}>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={email}
            placeholder="Enter Email"
          />
        </View>

        <View style={styles.input}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              autoCorrect={false}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={!showPassword}
              value={password}
            />

            <TouchableOpacity
              style={{
                position: "absolute",
                left: 280,
              }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>

        {/* Link to Signup */}
        <Text style={styles.formLink}>
          Already Have Account <Text style={styles.link}>Login</Text>
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        By using the DIVA app you agree to our .
      </Text>

      {/* Modal for displaying messages */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  logo: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
  },

  form: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  input: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  inputControl: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    width: 330,
    borderColor: "#C9D3DB",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C9D3DB",
  },

  btn: {
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  btnText: {
    color: "white",
    fontSize: 18,
  },

  formLink: {
    textAlign: "center",
    color: "#075eec",
    fontSize: 16,
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    marginTop: 20,
  },

  link: {
    color: "#075eec",
  },

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

export default RegistrationScreen;
