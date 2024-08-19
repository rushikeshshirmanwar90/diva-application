import { StyleSheet, Text, View, Dimensions, Image } from "react-native";
import React from "react";
import SwiperFlatList from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const Details = () => {
  const images = [
    "https://diva-images.blr1.digitaloceanspaces.com/df81e5514b5b3e97aa7bdabcf4ff7b2d.jpg",

    "https://diva-images.blr1.digitaloceanspaces.com/c3ed3aeb2cd9515167caa69f08bf6e14.jpg",

    "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2Faa8286b18036ef8915fd72e83b1049ec.jpg&w=256&q=75",
  ];

  return (
    <View>
      <View style={styles.container}>
        <SwiperFlatList
          autoplay
          autoplayDelay={5}
          autoplayLoop
          index={0}
          data={images}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={{ uri: item }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          )}
        />
      </View>
      
      <View>
        
      </View>
      

    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },

  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },

  bannerImage: {
    width: width - 25,
    marginVertical: 20,
    height: 430,
    borderRadius: 10,
  },
});
