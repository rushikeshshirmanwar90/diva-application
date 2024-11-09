import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { domain } from "../components/route/route";

// Icons
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string;
  stockLeft: number;
}

interface Recommendation {
  id: number;
  name: string;
  rating: number;
  price: number;
  originalPrice: number;
  imageUrl: string;
}

const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userId, setUserId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const truncateName = (name: string) => {
    const words = name.split(" ");
    if (words.length > 2) {
      return `${words.slice(0, 2).join(" ")}...`;
    }
    return name;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("@userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (!userId) return; // Don't fetch data if userId is empty

      const res = await fetch(
        `${domain}/api/carts?filters[$and][0][user_id][$eq]=${userId}`
      );

      const data = await res.json();

      const fetchedCartItems = data.data.map((item: any) => ({
        id: item.documentId,
        name: item.product_name,
        price: item.product_price,
        originalPrice: item.originalPrice || item.product_price,
        quantity: parseInt(item.qnt),
        imageUrl: `${domain}${item.img}`,
        stockLeft: 4, // Example data; adjust based on API response
      }));

      setCartItems(fetchedCartItems);
    };

    getData();
  }, [userId]);

  useEffect(() => {
    const calculateAndStoreTotal = async () => {
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      setTotalAmount(total);
      
      // Store the total in AsyncStorage
      try {
        await AsyncStorage.setItem('@cartTotal', total.toString());
      } catch (error) {
        console.error('Error storing cart total:', error);
      }
    };

    calculateAndStoreTotal();
  }, [cartItems]);

  const renderItem = ({ item }: { item: Recommendation }) => (
    <View style={styles.recommendationItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={styles.productName}>{truncateName(item.name)}</Text>
      <Text style={styles.productRating}>⭐ {item.rating}</Text>
      <Text style={styles.productPrice}>
        ₹{item.price}{" "}
        <Text style={styles.strikethrough}>MRP ₹{item.originalPrice}</Text>
      </Text>

      {/* View Product Button */}
      <TouchableOpacity style={styles.viewProductButton}>
        <Text style={styles.viewProductButtonText}>View Product</Text>
      </TouchableOpacity>
    </View>
  );

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      const response = await fetch(`${domain}/api/carts/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            qnt: newQuantity,
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error(
          `Failed to update quantity: ${
            responseData.message || "Unknown error"
          }`
        );
        console.error("Response status:", response.status);
        console.error("Response data:", responseData);
        return;
      }

      console.log("Updated item:", responseData);

      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleDecrement = (cartItemId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(cartItemId, currentQuantity - 1);
    }
  };

  const handleIncrement = (cartItemId: number, currentQuantity: number) => {
    updateQuantity(cartItemId, currentQuantity + 1);
  };

  const deleteCartItem = async (id: number) => {
    try {
      const response = await fetch(`${domain}/api/carts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete cart item:", response.status);
        return;
      }

      console.log("Cart item deleted successfully");
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {cartItems.map((cartItem, index) => (
          <View key={index} style={styles.cartItem}>
            <Image
              source={{ uri: cartItem.imageUrl }}
              style={styles.cartImage}
            />
            <View style={styles.cartDetails}>
              <Text style={styles.itemName}>{cartItem.name}</Text>
              <Text style={styles.itemPrice}>
                ₹{cartItem.price}{" "}
                <Text style={styles.strikethrough}>
                  ₹{cartItem.originalPrice}
                </Text>
              </Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={() =>
                    handleDecrement(cartItem.id, cartItem.quantity)
                  }
                  style={[
                    styles.quantityButton,
                    cartItem.quantity <= 1 && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleIncrement(cartItem.id, cartItem.quantity)
                  }
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                deleteCartItem(cartItem.id);
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "red",
                marginLeft: 10,
                height: 45,
                width: 45,
              }}
            >
              <FontAwesome5 name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Checkout - Sticky at the Bottom */}
      <View style={styles.bottomSection}>
        <Text style={styles.totalAmount}>₹{totalAmount}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Checkout");
          }}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>CHECKOUT SECURELY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100, // Added to give space for the sticky footer
  },
  cartItem: {
    flexDirection: "row",
    marginVertical: 16,
  },
  cartImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  cartDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#000",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 8,
    minWidth: 35,
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  recommendationsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 16,
  },
  recommendationsList: {
    marginBottom: 16,
  },
  recommendationItem: {
    marginRight: 16,
    width: 180,
  },
  productImage: {
    width: 150,
    height: 140,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productRating: {
    fontSize: 14,
    color: "#888",
  },
  productPrice: {
    fontSize: 16,
    color: "#000",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#333",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  viewProductButton: {
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewProductButtonText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "bold",
  },
});

export default CartScreen;
