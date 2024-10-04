import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const LoginSignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>

      <Text style={styles.logo}>DIVA</Text>
      <Text style={styles.title}>Login to DIVA</Text>

      {/* Form Fields */}
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

            <TouchableOpacity style={{
              position: 'absolute',
              left: 280,
            }} onPress={() => setShowPassword(!showPassword)}>
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
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        {/* Link to Signup */}
        <Text style={styles.formLink}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        By using the DIVA app you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text>.
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

export default LoginSignupScreen;
