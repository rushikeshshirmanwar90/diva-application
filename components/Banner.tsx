import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { domain } from "./route/route";
import { BannerProps } from "../interface/banner";
import SliderBox from "react-native-image-slider-box";

const { width } = Dimensions.get("window");

const Banner = () => {
  const [banner, setBanner] = useState<String[]>([]);
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${domain}/api/home-banners?populate=*`);
        const data = await res.json();

        // Sort banners based on priority
        const sortedBanners = data.data.sort(
          (a: BannerProps, b: BannerProps) =>
            b.attributes.priority - a.attributes.priority
        );

        // Map through sorted banners and extract the URL
        const bannerUrls = sortedBanners.map(
          (banner: BannerProps) => banner.attributes.banner.data.attributes.url
        );

        setBanner(bannerUrls); // Store the URLs in the array
        console.log(bannerUrls); // Log the URLs array

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
      <SliderBox
        ImageComponent={banner}
        sliderBoxHeight={200}
        onCurrentImagePressed={(index: any) =>
          console.warn(`image ${index} pressed`)
        }
        dotColor="#FFEE58"
        inactiveDotColor="#90A4AE"
        paginationBoxVerticalPadding={20}
        autoplay
        circleLoop
        resizeMethod={"resize"}
        resizeMode={"cover"}
        paginationBoxStyle={{
          position: "absolute",
          bottom: 0,
          padding: 0,
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
          paddingVertical: 10,
        }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 0,
          padding: 0,
          margin: 0,
          backgroundColor: "rgba(128, 128, 128, 0.92)",
        }}
        ImageComponentStyle={{ borderRadius: 15, width: "97%", marginTop: 5 }}
        imageLoadingColor="#2196F3"
      />
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
