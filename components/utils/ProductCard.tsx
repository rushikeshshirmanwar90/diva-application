import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

// importing styles
import styles from "../../styles/ProductCard";
import { Product } from "../../interface/Product";

const ProductCard: React.FC<{ item?: Product; navigation: any }> = ({
  item,
  navigation,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Details", { id: item.id });
      }}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: item?.attributes.images.data[0].attributes.url }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <Text style={styles.productTitle}>{item?.attributes.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{item?.attributes.price}</Text>
          <Text style={styles.originalPrice}>
            ₹{item?.attributes.compare_price}
          </Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Product</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
