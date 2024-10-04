import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/core";

// importing components
import CategorySection from "../components/CategorySection";

// Importing Styles
import { styles } from "../styles/Home";
import { utilsStyles } from "../styles/utils";

// importing interfaces
import { Product } from "../interface/Product";
import { categories } from "../interface/Category";

// importing Domain
import { domain } from "../components/route/route";
import Banners from "../components/Banner";
import CategorySwiper from "../components/CategorySwiper";

const Home: React.FC<{
  navigation: any;
}> = ({ navigation }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [category, setCategory] = useState<categories[]>([]);

  // product states
  const [womenProduct, setWomenProduct] = useState<Product[]>([]);
  const [menProduct, setMenProduct] = useState<Product[]>([]);

  // loading states
  const [isProductLoaded, setIsProductLoaded] = useState<boolean>(false);
  const [isCategoryLoaded, setIsCategoryLoaded] = useState<boolean>(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState<boolean>(false);

  // FETCHING PRODUCT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${domain}/api/products?populate=*`);

        const data = await response.json();
        const allProducts: Product[] = data.data;

        const menProduct = allProducts.filter(
          (item) => item.attributes.gender === "male"
        );

        const womenProduct = allProducts.filter(
          (item) => item.attributes.gender === "female"
        );

        setWomenProduct(womenProduct);
        setMenProduct(menProduct);
        setIsProductLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isProductLoaded]);

  // FETCHING CATEGORY
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${domain}/api/categories?populate=*`);
        const data = await response.json();
        setCategory(data.data);
        setIsCategoryLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [isCategoryLoaded]);

  // FETCHING BANNERS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${domain}/api/home-banners?populate=*`);
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        setBanners(data.data);
        setIsBannerLoaded(false);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchData();
  }, [isBannerLoaded]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.mainContainer}
      >
        {/*==========================
          Header section
        =============================*/}

        <View style={[styles.headerContainer]}>
          <View style={{ width: "50%" }}>
            <Text style={styles.logo}>DIVA</Text>
          </View>

          <View style={{ width: "50%", alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("My Cart");
              }}
            >
              <Image
                source={require("../assets/images/bag-2.png")}
                style={{ width: 16, height: 20 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/*==========================
              searchbar section
        ==========================*/}

        <View style={styles.MainSearchBarContainer}>
          <View style={styles.searchBoxContainer}>
            <Icon name="search" size={22} color="#4f4a4a" />
            <TextInput
              placeholder="Search"
              style={{
                fontFamily: "Medium",
                paddingHorizontal: 10,
                fontSize: 12,
              }}
            />
          </View>
        </View>

        {/*==========================
            Home Banner Section
        ========================== */}
        <View style={{ marginBottom: 25 }}>
          <Banners navigation={navigation} />
        </View>

        {/* =========================
            Best Selling for Womens
        ========================== */}
        <View>
          <View style={utilsStyles.titleContainer}>
            <Text style={utilsStyles.title}>Best Selling</Text>
            <View style={utilsStyles.dot}></View>
            <Text style={utilsStyles.subTitle}>For Womens</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategorySection product={womenProduct} navigation={navigation} />
          </ScrollView>
        </View>

        <View style={{ marginVertical: 25 }}>
          <CategorySwiper navigation={navigation} />
        </View>

        {/* =========================
            Best Selling for mens
        ========================== */}
        <View style={{ marginTop: 20 }}>
          <View style={utilsStyles.titleContainer}>
            <Text style={utilsStyles.title}>Best Selling</Text>
            <View style={utilsStyles.dot}></View>
            <Text style={utilsStyles.subTitle}>For mens</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategorySection product={menProduct} navigation={navigation} />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
