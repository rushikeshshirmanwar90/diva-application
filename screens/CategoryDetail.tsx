import { StyleSheet, View, Image } from "react-native";
import CategoryBar from "../components/FilterButton";
import ProductList from "../components/Products";
import React from "react";


const CategoryDetail = () => {
  return (
    <View
      style={{
        marginTop: 2,
      }}
    >
      <View>
        <Image
          source={{
            uri: "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2F4c7ffa2a3089c833182d160b38dcd0c3.jpg&w=3840&q=75",
          }}
          height={210}
          style={{
            borderRadius: 10,
          }}
        />
      </View>
      <View style={{ marginVertical: 5 }}>
        <CategoryBar />
      </View>
      <View>
        <ProductList />
      </View>
    </View>
  );
};

export default CategoryDetail;

const styles = StyleSheet.create({});