import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },

  swiperContainer: {
    width: width,
    marginLeft: -15,
    marginBottom: 10,
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

  productContainer: {
    marginBottom: 20,
  },

  title: {
    fontSize: 16,
    color: "#333",
  },

  productTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  rating: {
    fontSize: 17,
    color: "#333",
  },

  infoContainer: {
    marginVertical: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  infoText: {
    fontSize: 17,
    color: "#333",
    marginLeft: 8,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  price: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },

  mrp: {
    fontSize: 17,
    color: "#999",
    marginLeft: 10,
    textDecorationLine: "line-through",
  },

  cartButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    width: width - 20,
    borderRadius: 8,
    alignItems: "center",
  },

  cartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
