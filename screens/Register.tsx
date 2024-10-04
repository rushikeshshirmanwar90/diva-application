import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "@react-native-firebase/auth";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { auth } from "../firebase/config";

const RegistrationScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={email}
            placeholder="Enter Full name"
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
            placeholder="Enter E-mail"
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
        <TouchableOpacity style={styles.btn}>
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
});

export default RegistrationScreen;