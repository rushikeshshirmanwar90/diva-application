import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { domain } from "./route/route";
import { BannerProps } from "../interface/banner";

const { width } = Dimensions.get("window");

const Banner = () => {
  const [banner, setBanner] = useState<BannerProps[]>([]);
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

  // Automatic scroll for banners every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        const nextIndex = (currentIndex + 1) % banner.length;
        setCurrentIndex(nextIndex);
        flatListRef.current.scrollToIndex({ index: nextIndex });
      }
    }, 5000); // 5 seconds delay

    return () => clearInterval(interval);
  }, [currentIndex, banner.length]);

  if (bannerLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={banner}
        horizontal
        pagingEnabled
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.attributes.banner.data.attributes.url }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {banner.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => {
              setCurrentIndex(index);
              flatListRef.current?.scrollToIndex({ index });
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },

  bannerImage: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
  },

  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },

  dot: {
    margin: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  activeDot: {
    backgroundColor: "#D6AA65",
  },

  inactiveDot: {
    backgroundColor: "#333",
  },
});
