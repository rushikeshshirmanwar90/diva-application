import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";

interface CartItem {
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

const CartScreen = ({ navigation }) => {
  const cartItem: CartItem = {
    name: "Golden Elegant Ganesha Rakhi",
    price: 899,
    originalPrice: 1599,
    quantity: 2,
    imageUrl:
      "https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727034644/stock_img_12_90cd962f05.jpg",
    stockLeft: 4,
  };

  const recommendations: Recommendation[] = [
    {
      id: 1,
      name: "Tropical Blossom ",
      rating: 5.0,
      price: 499,
      originalPrice: 999,
      imageUrl:
        "https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727378092/stock_img_11_5349fd3880.jpg",
    },
    {
      id: 2,
      name: "Opulent Fragrant Candles Box of 4",
      rating: 4.9,
      price: 499,
      originalPrice: 899,
      imageUrl:
        "https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727378182/stock_img_7_00f33603db.jpg",
    },
  ];

  const renderItem = ({ item }: { item: Recommendation }) => {
    // Truncate the product name to 2 words if needed
    const truncateName = (name: string) => {
      const words = name.split(" ");
      if (words.length > 2) {
        return `${words.slice(0, 2).join(" ")}...`;
      }
      return name;
    };

    return (
      <View style={styles.recommendationItem}>
        <Image
          source={{
            uri: item.imageUrl,
          }}
          style={styles.productImage}
        />
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
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Cart Item */}
        <View style={styles.cartItem}>
          <Image source={{ uri: cartItem.imageUrl }} style={styles.cartImage} />
          <View style={styles.cartDetails}>
            <Text style={styles.itemName}>{cartItem.name}</Text>
            <Text style={styles.itemPrice}>
              ₹{cartItem.price}{" "}
              <Text style={styles.strikethrough}>
                ₹{cartItem.originalPrice}
              </Text>
            </Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity>
                <Text style={styles.quantityButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              <TouchableOpacity>
                <Text style={styles.quantityButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <Text style={styles.recommendationsHeader}>Must-haves</Text>
        <FlatList
          horizontal
          data={recommendations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          style={styles.recommendationsList}
        />
      </ScrollView>

      {/* Bottom Checkout - Sticky at the Bottom */}
      <View style={styles.bottomSection}>
        <Text style={styles.totalAmount}>₹1798</Text>
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
    fontSize: 20,
    paddingHorizontal: 10,
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
    backgroundColor: "#F57698",
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
