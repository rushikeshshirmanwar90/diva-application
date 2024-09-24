import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";

interface AddressFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
}

const AddressSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Phone number must be 10 digits"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  postalCode: Yup.string()
    .required("Postal code is required")
    .matches(/^\d{6}$/, "Postal code must be 6 digits"),
  address: Yup.string().required("Address is required"),
});

const BillingAddressForm: React.FC = () => {
  const initialValues: AddressFormValues = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    city: "",
    state: "",
    postalCode: "",
    address: "",
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Billing Address</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={AddressSchema}
        onSubmit={(values) => {
          // Handle form submission
          console.log("Form Data:", values);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              label="First Name"
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              value={values.firstName}
              style={styles.input}
            />
            {touched.firstName && errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <TextInput
              label="Last Name"
              onChangeText={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
              value={values.lastName}
              style={styles.input}
            />
            {touched.lastName && errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TextInput
              label="Phone Number"
              onChangeText={handleChange("phoneNumber")}
              onBlur={handleBlur("phoneNumber")}
              value={values.phoneNumber}
              style={styles.input}
              keyboardType="numeric"
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            <TextInput
              label="Enter Email"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              style={styles.input}
              keyboardType="email-address"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              label="City"
              onChangeText={handleChange("city")}
              onBlur={handleBlur("city")}
              value={values.city}
              style={styles.input}
            />

            {touched.city && errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}

            <TextInput
              label="State"
              onChangeText={handleChange("state")}
              onBlur={handleBlur("state")}
              value={values.state}
              style={styles.input}
            />

            {touched.state && errors.state && (
              <Text style={styles.errorText}>{errors.state}</Text>
            )}

            <TextInput
              label="Pin Code"
              onChangeText={handleChange("postalCode")}
              onBlur={handleBlur("postalCode")}
              value={values.postalCode}
              style={styles.input}
              keyboardType="numeric"
            />

            {touched.postalCode && errors.postalCode && (
              <Text style={styles.errorText}>{errors.postalCode}</Text>
            )}

            <TextInput
              label="Address"
              onChangeText={handleChange("address")}
              onBlur={handleBlur("address")}
              value={values.address}
              style={styles.textArea}
              multiline
              numberOfLines={4}
            />

            {touched.address && errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit as any}
              style={styles.button}
            >
              Checkout Now
            </Button>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({

    container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    },

    input: {
    marginBottom: 10,
    },

    textArea: {
    marginBottom: 10,
    height: 100,
    textAlignVertical: "top",
    },
    
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
    },
  
  button: {
    marginTop: 20,
    },
  
});

export default BillingAddressForm;