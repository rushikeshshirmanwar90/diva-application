import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import PaymentOptions from "../components/PaymentMethod";
import { FontAwesome } from "@expo/vector-icons"; // For the lock icon
import { domain } from "../components/route/route";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Errors {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("cards");
  const [userId, setUserId] = useState<string>("");
  const [isUserAddressPresent, setIsUserAddressPresent] =
    useState<boolean>(false);

  const [billingId, setBillingId] = useState<number>();

  const [errors, setErrors] = useState<Errors>({});

  const [cartTotal, setCartTotal] = useState<string>("0");

  useEffect(() => {
    const getCartTotal = async () => {
      try {
        const total = await AsyncStorage.getItem("@cartTotal");
        if (total) {
          setCartTotal(total);
        }
      } catch (error) {
        console.error("Error retrieving cart total:", error);
      }
    };

    getCartTotal();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!firstName) newErrors.firstName = "First Name is required";
    if (!lastName) newErrors.lastName = "Last Name is required";
    if (!addressLine1) newErrors.addressLine1 = "Address Line 1 is required";

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

  useEffect(() => {
    const checkAddress = async () => {
      const res = await fetch(
        `${domain}/api/billing-addresses?filters[$and][0][user_id][$eq]=${userId}`
      );
      const data = await res.json();

      if (data.data.length > 0) {
        setIsUserAddressPresent(true);
        setBillingId(data.data[0].documentId);
        setAddressLine1(data.data[0].address);
        setFirstName(data.data[0].first_name);
        setLastName(data.data[0].last_name);
        setPincode(data.data[0].pincode);
        setCity(data.data[0].city);
        setPhone(data.data[0].phone_number);
        setEmail(data.data[0].email);
        setState(data.data[0].state);
      }
    };

    checkAddress();
  }, [userId]);

  const handlePayNow = async () => {
    try {
      if (validateForm()) {
        const formData = {
          data: {
            first_name: firstName,
            last_name: lastName,
            address: addressLine1,
            city: city,
            pincode: pincode,
            state: state,
            country: "India",
            email: email,
            user_id: userId,
            phone_number: Number(phone),
          },
        };

        let response;
        if (isUserAddressPresent) {
          // Use PUT method to update existing address
          response = await fetch(
            `${domain}/api/billing-addresses/${billingId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );
        } else {
          // Use POST method to create new address
          response = await fetch(`${domain}/api/billing-addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
        }

        if (response.ok) {
          Alert.alert(
            "Success",
            isUserAddressPresent
              ? "Billing address updated successfully"
              : "Billing address saved successfully"
          );
          // You might want to navigate to the next screen or process payment here
        } else {
          const errorText = await response.text();
          console.error("Error in response:", errorText);
          Alert.alert("Error", "Failed to save billing address");
        }
      } else {
        Alert.alert("Error", "Please correct the errors before proceeding");
      }
    } catch (error) {
      console.error("Network or server error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Get UserId
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("@userId");
        if (userId) {
          setUserId(userId);
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    };

    checkUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: "white" }}>
      <View style={{ padding: 15 }}>
        <View style={{ backgroundColor: "#333", padding: 10 }}>
          <Text style={{ fontSize: 17, color: "#fff", fontWeight: "bold" }}>
            Shipping Address
          </Text>
        </View>

        <View style={{ padding: 15 }}>
          <Text style={{ fontWeight: "bold" }}>First Name*</Text>
          <TextInput
            placeholder="eg: John Doe"
            value={firstName}
            onChangeText={setFirstName}
            style={{
              borderWidth: 1,
              borderColor: errors.firstName ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.firstName && (
            <Text style={{ color: "red" }}>{errors.firstName}</Text>
          )}

          <Text style={{ fontWeight: "bold" }}>Last Name*</Text>
          <TextInput
            placeholder="eg: John Doe"
            value={lastName}
            onChangeText={setLastName}
            style={{
              borderWidth: 1,
              borderColor: errors.lastName ? "red" : "#ccc",
              padding: 10,
              borderRadius: 8,
              marginVertical: 10,
            }}
          />
          {errors.lastName && (
            <Text style={{ color: "red" }}>{errors.lastName}</Text>
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
        <PaymentOptions onPaymentMethodChange={setSelectedPayment} />
      </View>

      {/* Total Price and Submit Button */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.container}>
          {/* Price Text */}
          <Text style={styles.priceText}>₹{cartTotal}</Text>

          {/* Pay Now Button */}
          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <FontAwesome name="lock" size={20} color="white" />
            <Text style={styles.payText}>PAY NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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

export default CheckoutScreen;
