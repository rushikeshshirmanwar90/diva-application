import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";

const CategoryBar = () => {
  const categories = [
    "1 Gram Gold Mangalsutra",
    "Sterling Silver Bracelet for women's",
    "Sterling Silver cuff Ring For Women's",
    "Sterling Silver Toe Ring",
    "Silver couple rings",
    "Fusion Kada And Bracelet",
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryItem}>
            <Text style={styles.categoryText}>{category}</Text>
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