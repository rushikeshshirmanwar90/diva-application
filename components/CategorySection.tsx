import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ProductCard from "./utils/ProductCard";
import { domain } from "./route/route";
import { Product } from "../interface/Product";

const CategorySection: React.FC<{ product?: Product[] }> = ({ product }) => {
  const [productData, setProductData] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(
          `${domain}/api/products?populate=*&filters[$and][0][gender][$eq]=female&filters[$and][1][feature][$eq]=true`
        );
        const data = await res.json();
        setProductData(data.data);
      } catch (e: any) {
        console.log(e.message);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProductData();
  }, []);

  // Check if productData is populated before rendering ProductCards
  if (productLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.flex}>
      {productData.map((item, index) => (
        <ProductCard item={item} key={index} />
      ))}
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  flex: {
    flexDirection: "row",
    overflow: "scroll",
  },
});