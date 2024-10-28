import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { domain } from "../components/route/route";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginSignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const userId = await AsyncStorage.getItem("@userId");
      if (userId) {
        navigation.navigate("DIVA");
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    try {
      if (validateEmail(email)) {
        const data = await getUserData(email, password);
        if (data.length !== 0) {
          await AsyncStorage.setItem("@userId", String(data[0].id));
          navigation.navigate("DIVA");
        } else {
          setModalMessage(
            "User does not exist with the provided email or password"
          );
          setShowModal(true);
          setTimeout(() => setShowModal(false), 1500);
        }
      } else {
        setModalMessage("Invalid Email Format");
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const getUserData = async (email: string, password: string) => {
    try {
      const res = await fetch(
        `${domain}/api/user-ids?filters[$and][0][email][$eq]=${email}&filters[$and][1][password][$eq]=${password}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error: any) {
      console.error("Error checking user existence:", error.message);
      return [];
    }
  };

  const validateEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DIVA</Text>
      <Text style={styles.title}>Login to DIVA</Text>

      <View style={styles.form}>
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
              style={{ position: "absolute", left: 280 }}
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

        <TouchableOpacity onPress={handleLogin} style={styles.btn}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.formLink}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </View>

      <Text style={styles.footerText}>
        By using the DIVA app you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text>.
      </Text>

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

export default LoginSignupScreen;
