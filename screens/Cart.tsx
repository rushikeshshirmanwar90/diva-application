import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";

// Sample product data
const products = [
  {
    id: 1,
    name: "Product 1",
    price: 29.99,
    image:
      "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2Fbb687176adbf80e7fd4a783e225d6c97.jpg&w=256&q=75",
    quantity: 1,
  },
  {
    id: 2,
    name: "Product 2",
    price: 19.99,
    image:
      "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2Fbb687176adbf80e7fd4a783e225d6c97.jpg&w=256&q=75",
    quantity: 1,
  },
  {
    id: 3,
    name: "Product 3",
    price: 39.99,
    image:
      "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2Fbb687176adbf80e7fd4a783e225d6c97.jpg&w=256&q=75",
    quantity: 1,
  },

];

const CartScreen = () => {
  const [cartItems, setCartItems] = useState(products);

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const incrementQuantity = (id: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const decrementQuantity = (id: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
  };

  const renderItem = ({ item }: { item: (typeof products)[0] }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decrementQuantity(item.id)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => incrementQuantity(item.id)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{ backgroundColor: "#ff3b30", padding: 5, borderRadius: 10 }}
      >
        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Icon name="trash" size={24} color="#f1f1f1" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (

    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

export default CartScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  listContainer: {
    paddingBottom: 20,
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 18,
    fontWeight: "500",
  },

  itemPrice: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  quantityButton: {
    backgroundColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginHorizontal: 5,
  },

  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  quantityText: {
    fontSize: 16,
  },

  removeButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },

  removeButtonText: {
    color: "#fff",
    fontSize: 14,
  },

  footer: {
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  checkoutButton: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },

  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },

});