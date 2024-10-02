import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { domain } from "./route/route";

const CategoryBar = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<
    { id: string; name: string; bannerUrl: any }[]
  >([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${domain}/api/categories?populate=*`);
        const data = await res.json();

        // Map through the data to get id, name, and banner URL
        const formattedCategories = data.data.map((category: any) => ({
          id: category.id,
          name: category.attributes.name,
          bannerUrl: category.attributes.bannner.data.attributes.url,
        }));

        setCategories(formattedCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  console.log(categories[0].bannerUrl);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}
            onPress={() => {
              navigation.navigate("Category Detail", {
                id: category.id,
                banner: category.bannerUrl,
              });
            }}
          >
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },

  categoryItem: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CategoryBar;
