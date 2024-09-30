import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Sterling Silver Toe Ring (बिछवा)",
    price: 850,
    originalPrice: 1600,
    imageUrl:
      "https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727034644/stock_img_12_90cd962f05.jpg",
  },
  {
    id: "2",
    name: "Sterling Silver Toe Ring (बिछवा)",
    price: 850,
    originalPrice: 1600,
    imageUrl:
      "https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727034643/stock_img_14_19402cf720.jpg",
  },
];

interface ProductCardProps {
  item: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹ {item.price}</Text>
        <Text style={styles.originalPrice}>₹ {item.originalPrice}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Product</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductList: React.FC = () => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard item={item} />}
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
