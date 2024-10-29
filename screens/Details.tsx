import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "../styles/Details";
import CategorySection from "../components/CategorySection";
import { utilsStyles } from "../styles/utils";
import ReviewModal from "../components/Mode";
import { useRoute } from "@react-navigation/native";
import ReviewCard from "../components/ReviewCard";
import { Product } from "../interface/Product";
import { domain } from "../components/route/route";
import { addToCart } from "../functions/cart/main";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Models from "../components/utils/Models";

const Details: React.FC<{
  navigation: any;
}> = ({ navigation }) => {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userId, setUserId] = useState<string>("");

  const route = useRoute();
  const { id }: any = route.params;

  // GET THE PRODUCT DATA
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${domain}/api/products/${id}?populate=*`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data: any = await response.json();
        setProduct(data.data);

        console.log(data.data.images[0].url);

        // Map and set product images
        const mappedImages = data.data.images.map((item: any) => item.url);
        setImages(mappedImages);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("@userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    };
    checkUser();
  }, []);

  // Check if data is still loading
  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const checkProductInCart = async () => {
    console.log("userId : " + userId);
    console.log("productId : " + id);

    const res = await fetch(
      `${domain}/api/carts?filters[$and][0][user_id][$eq]=${userId}&filters[$and][1][Product_id][$eq]=${id}`
    );

    const data = await res.json();

    console.log(data.data.length);

    return data.data.length > 0;
  };

  const handleAddToCart = async () => {
    const isProductInCart = await checkProductInCart();

    console.log(isProductInCart);

    if (!isProductInCart) {
      await addToCart(
        String(id),
        userId,
        product?.name,
        product?.price,
        images[0]
      );
      setModalTime("Product Added Successfully", 1000);
    } else {
      setModalTime("Product Already In cart", 1000);
    }
  };

  const setModalTime = (msg: string, time: number) => {
    setModalMessage(msg);
    setShowModal(true);
    setTimeout(() => setShowModal(false), time);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Product images slider */}
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
                    source={{ uri: `${domain}${item}` }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          </View>

          {/* Product details */}
          <View style={styles.productContainer}>
            <Text style={styles.title}>Diva The Indian Jewel</Text>
            <Text style={styles.productTitle}>
              {product?.name || "No Name"}
            </Text>

            {/* Price and MRP */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product?.price || "N/A"}</Text>
              <Text style={styles.mrp}>
                MRP ₹{product?.compare_price || "N/A"}
              </Text>
            </View>

            {/* Rating section */}
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>0 </Text>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}> (0 reviews)</Text>
            </View>

            {/* Product info like return policy, warranty, etc. */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Icon name="autorenew" size={30} color="#333" />
              </View>

              <View style={styles.infoRow}>
                <Icon name="verified-user" size={30} color="#333" />
                <Text style={styles.infoText}>
                  {product?.Warranty_6_month
                    ? "6 Months Warranty"
                    : "No Warranty"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  {product?.description
                    ? product.description
                    : "No Description Available"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Similar products and reviews section */}
        <View style={{ marginTop: -25, padding: 15 }}>
          <View style={{ marginTop: 20 }}>
            <View style={utilsStyles.titleContainer}>
              <Text style={utilsStyles.title}>Similar Products</Text>
              <View style={utilsStyles.dot}></View>
            </View>

            {/* Horizontal ScrollView for similar products */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <CategorySection navigation={navigation} />
            </ScrollView>
          </View>

          {/* Review modal and cards */}
          <View>
            <ReviewModal />
            <ReviewCard />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add To Cart Button */}
      <View style={styles.stickyCartButtonContainer}>
        <TouchableOpacity onPress={handleAddToCart} style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Add To Cart</Text>
        </TouchableOpacity>
      </View>
      <Models showModal={showModal} modalMessage={modalMessage} />
    </View>
  );
};

export default Details;
