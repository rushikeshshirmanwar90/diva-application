import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

// importing styles
import styles from "../../styles/ProductCard";
import { Product } from "../../interface/Product";
import { domain } from "../route/route";

const ProductCard: React.FC<{ item?: Product; navigation: any }> = ({
  item,
  navigation,
}) => {
  const imageUrl = item?.images?.[0]?.url ?? "";

  return (
    <TouchableOpacity
      onPress={() => {
        if (item?.id) {
          navigation.navigate("Details", { id: item.documentId });
        }
      }}
    >
      <View style={styles.card}>
        {imageUrl ? (
          <Image
            source={{ uri: `${domain}${imageUrl}` }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Text>Image not available</Text>
        )}

        <Text style={styles.productTitle}>{item?.name ?? "Product Name"}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{item?.price ?? "N/A"}</Text>
          {item?.compare_price && (
            <Text style={styles.originalPrice}>₹{item.compare_price}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Product</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
