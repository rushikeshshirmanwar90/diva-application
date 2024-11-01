import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import PaymentOptions from "../components/PaymentMethod";
import PaymentButton from "../components/PayNow";

interface Errors {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

const CheckoutScreen: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [addressLine2, setAddressLine2] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [errors, setErrors] = useState<Errors>({});

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!addressLine1) newErrors.addressLine1 = "Address Line 1 is required";
    if (!addressLine2) newErrors.addressLine2 = "Address Line 2 is required";

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    if (!city) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Invalid phone number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      Alert.alert("Success", "Form submitted successfully");
    } else {
      Alert.alert("Error", "Please correct the errors before submitting");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: "white" }}>
      <View style={{ padding: 15 }}>
        <View style={{ backgroundColor: "#333", padding: 10 }}>
          <Text style={{ fontSize: 17, color: "#fff", fontWeight: "bold" }}>
            Shipping Address
          </Text>
        </View>

        <View style={{ padding: 15 }}>
          <Text style={{ fontWeight: "bold" }}>Full Name*</Text>
          <TextInput
            placeholder="eg: John Doe"
            value={fullName}
            onChangeText={setFullName}
            style={{
              borderWidth: 1,
              borderColor: errors.fullName ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.fullName && (
            <Text style={{ color: "red" }}>{errors.fullName}</Text>
          )}

          <Text style={{ fontWeight: "bold" }}>
            Address Line 1 (Street, Area)*
          </Text>
          <TextInput
            placeholder="eg: Street name"
            value={addressLine1}
            onChangeText={setAddressLine1}
            style={{
              borderWidth: 1,
              borderColor: errors.addressLine1 ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.addressLine1 && (
            <Text style={{ color: "red" }}>{errors.addressLine1}</Text>
          )}

          <Text style={{ fontWeight: "bold" }}>
            Address Line 2 (House Number, Building)*
          </Text>
          <TextInput
            placeholder="eg: House/Flat no"
            value={addressLine2}
            onChangeText={setAddressLine2}
            style={{
              borderWidth: 1,
              borderColor: errors.addressLine2 ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.addressLine2 && (
            <Text style={{ color: "red" }}>{errors.addressLine2}</Text>
          )}

          <Text style={{ fontWeight: "bold" }}>Pincode*</Text>
          <TextInput
            placeholder="eg: 509001"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: errors.pincode ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.pincode && (
            <Text style={{ color: "red" }}>{errors.pincode}</Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Town/City*</Text>
              <TextInput
                placeholder="eg: Bengaluru"
                value={city}
                onChangeText={setCity}
                style={{
                  borderWidth: 1,
                  borderColor: errors.city ? "red" : "#ccc",
                  padding: 10,
                  borderRadius: 8,
                  marginVertical: 10,
                }}
              />

              {errors.city && (
                <Text style={{ color: "red" }}>{errors.city}</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>Select State/UT*</Text>
              <Picker
                selectedValue={state}
                onValueChange={(itemValue: string) => setState(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: errors.state ? "red" : "#ccc",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Picker.Item label="Select State/UT" value="" />
                <Picker.Item label="Karnataka" value="Karnataka" />
                <Picker.Item label="Maharashtra" value="Maharashtra" />
              </Picker>
              {errors.state && (
                <Text style={{ color: "red" }}>{errors.state}</Text>
              )}
            </View>
          </View>

          {/* Phone */}
          <Text style={{ fontWeight: "bold" }}>Phone*</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: errors.phone ? "red" : "#ccc",
              borderRadius: 8,
              marginVertical: 10,
            }}
          >
            <Text style={{ padding: 10 }}>+91</Text>
            <TextInput
              placeholder="9579896842"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{ flex: 1, padding: 10 }}
            />
          </View>
          {errors.phone && <Text style={{ color: "red" }}>{errors.phone}</Text>}

          {/* Email */}
          <Text style={{ fontWeight: "bold" }}>Enter Your Email*</Text>
          <TextInput
            placeholder="youremail@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: errors.email ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />

          {errors.email && <Text style={{ color: "red" }}>{errors.email}</Text>}
        </View>
      </View>

      <View style={{ backgroundColor: "#333", padding: 10 }}>
        <Text style={{ fontSize: 17, color: "#fff", fontWeight: "bold" }}>
          Payment Method
        </Text>
      </View>

      <View style={{ padding: 15 }}>
        <PaymentOptions />
      </View>

      {/* Total Price and Submit Button */}
      <View style={{ marginTop: 20 }}>
        <PaymentButton />
      </View>
    </ScrollView>
  );
};

export default CheckoutScreen;