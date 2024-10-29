import React, { useEffect } from "react";
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

import Banners from "../components/Banner";
import CategorySwiper from "../components/CategorySwiper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.mainContainer}
      >
        {/*
          ==========================
              Header section
          =============================
        */}

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
            <CategorySection navigation={navigation} />
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
            <CategorySection navigation={navigation} />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
