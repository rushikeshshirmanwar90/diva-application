import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ProductCard from "./utils/ProductCard";
import { Product } from "../interface/Product";

const ProductList: React.FC<{ products: Product[]; navigation: any }> = ({
  products,
  navigation,
}) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard navigation={navigation} item={item} />
      )}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },

  card: {
    flex: 1,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },

  name: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 45,
  },

  price: {
    fontSize: 15,
    color: "#000",
    fontWeight: "bold",
  },

  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 5,
  },

  button: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#000",
    width: "100%",
  },

  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProductList;
