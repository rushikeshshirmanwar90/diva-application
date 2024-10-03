import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { domain } from "./route/route";
import { categories } from "../interface/Category";

const { width } = Dimensions.get("window");

const CategorySwiper = ({ navigation }) => {
  const [categories, setCategories] = useState<categories[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${domain}/api/categories?populate=*`);
        const data = await res.json();
        setCategories(data.data);
        setCategoriesLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategoriesLoading(false);
      }
    };

    getData();
  }, []);


  if (categoriesLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {categories.map((item: categories, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            navigation.navigate("Category Detail", {
              id: item.id,
              banner: item.attributes.bannner.data.attributes.url,
            });
          }}
        >
          <View key={item.id} style={styles.item}>
            <Image
              source={{ uri: item.attributes.home_pic.data.attributes.url }}
              style={styles.image}
            />

            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {item.attributes.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  item: {
    width: width / 3 - 20, // Adjust the width to show 3 items per frame with margins
    alignItems: "center",
    marginHorizontal: 10,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 75,
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "semibold",
    width: "100%",
  },
});

export default CategorySwiper;
