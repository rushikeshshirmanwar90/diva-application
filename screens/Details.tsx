import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "../styles/Details";
import CategorySection from "../components/CategorySection";
import { utilsStyles } from "../styles/utils";
import ReviewModal from "../components/Mode";
import ReviewCard from "../components/ReviewCard";

const Details = () => {
  const images = [
    "https://diva-images.blr1.digitaloceanspaces.com/df81e5514b5b3e97aa7bdabcf4ff7b2d.jpg",
    "https://diva-images.blr1.digitaloceanspaces.com/c3ed3aeb2cd9515167caa69f08bf6e14.jpg",
    "https://divatheindianjewel.com/_next/image?url=https%3A%2F%2Fdiva-images.blr1.digitaloceanspaces.com%2Faa8286b18036ef8915fd72e83b1049ec.jpg&w=256&q=75",
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Extra padding for scrollable content */}
        <View style={{ padding: 16 }}>
          <View style={styles.swiperContainer}>
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

          {/* Product Details */}
          <View style={styles.productContainer}>
            <Text style={styles.title}>Diva The Indian Jewel</Text>
            <Text style={styles.productTitle}>
              Sterling Silver Bracelet for Women
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹1400</Text>
              <Text style={styles.mrp}>MRP ₹2000</Text>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>0 </Text>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}> (0 reviews)</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Icon name="autorenew" size={30} color="#333" />
                <Text style={styles.infoText}>15 Days Return Policy</Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="verified-user" size={30} color="#333" />
                <Text style={styles.infoText}>6 Months Warranty</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>No Description</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: -25, padding: 15 }}>
          <View style={{ marginTop: 20 }}>
            <View style={utilsStyles.titleContainer}>
              <Text style={utilsStyles.title}>Similar Products</Text>
              <View style={utilsStyles.dot}></View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <CategorySection />
            </ScrollView>
          </View>

          <View>
            <ReviewModal />
            <ReviewCard />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add To Cart Button */}
      <View style={styles.stickyCartButtonContainer}>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Add To Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Details;