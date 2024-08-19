import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { domain } from "./route/route";
import { BannerProps } from "../interface/banner";

// SWIPER Library
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const Banner = () => {
  const [banner, setBanner] = useState<BannerProps[]>([]);
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${domain}/api/home-banners?populate=*`);
        const data = await res.json();
        const sortedBanners = data.data.sort(
          (a: BannerProps, b: BannerProps) =>
            b.attributes.priority - a.attributes.priority
        );
        setBanner(sortedBanners);
        setBannerLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBannerLoading(false);
      }
    };

    getData();
  }, []);

  if (bannerLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwiperFlatList
        autoplay
        autoplayDelay={5}
        autoplayLoop
        index={0}
        paginationStyle={styles.paginationStyle}
        paginationStyleItem={styles.paginationStyleItem}
        paginationActiveColor="#D6AA65"
        showPagination
        data={banner}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.attributes.banner.data.attributes.url }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensure the container takes up full width
  },
  
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  slide: {
    width: width, // Full screen width for the slide
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: width, // Adjust the width to leave some margin
    height: 200,
    borderRadius: 10,
  },

  paginationStyle: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  paginationStyleItem: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: "#333", // Customize dot color
  },
});
