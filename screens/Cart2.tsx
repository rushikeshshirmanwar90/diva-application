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

const CartScreen: React.FC = () => {
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
      name: "Tropical Blossom Scented Candle",
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

  const renderItem = ({ item }: { item: Recommendation }) => (
    <View style={styles.recommendationItem}>
      <Image
        source={{
          uri: `https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727378182/stock_img_7_00f33603db.jpg`,
        }}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productRating}>⭐ {item.rating}</Text>
      <Text style={styles.productPrice}>
        ₹{item.price}{" "}
        <Text style={styles.strikethrough}>MRP ₹{item.originalPrice}</Text>
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Cart Item */}
      <View style={styles.cartItem}>
        <Image source={{ uri: cartItem.imageUrl }} style={styles.cartImage} />
        <View style={styles.cartDetails}>
          <Text style={styles.itemName}>{cartItem.name}</Text>
          <Text style={styles.itemPrice}>
            ₹{cartItem.price}{" "}
            <Text style={styles.strikethrough}>₹{cartItem.originalPrice}</Text>
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
      {/* <FlatList
        horizontal
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.recommendationsList}
      /> */}

      <View style={styles.recommendationItem}>
        <Image
          source={{
            uri: `https://res.cloudinary.com/dlcq8i2sc/image/upload/v1727378182/stock_img_7_00f33603db.jpg`,
          }}
          style={styles.productImage}
        />
        <Text style={styles.productName}>Tropical Blossom Scented Candle</Text>
        <Text style={styles.productRating}>⭐ 5</Text>
        <Text style={styles.productPrice}>
          ₹1798
          <Text style={styles.strikethrough}>MRP ₹2000</Text>
        </Text>
      </View>

      {/* Bottom Checkout */}
      <View style={styles.bottomSection}>
        <Text style={styles.totalAmount}>₹1798</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>CHECKOUT SECURELY</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
  cartItem: {
    flexDirection: "row",
    marginVertical: 16,
  },
  cartImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  cartDetails: {
    flex: 1,
    marginLeft: 16,
  },
  stockText: {
    color: "red",
    fontWeight: "bold",
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
  actionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 8,
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
    width: 120,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  productRating: {
    fontSize: 12,
    color: "#888",
  },
  productPrice: {
    fontSize: 14,
    color: "#000",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#f53d3d",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CartScreen;
