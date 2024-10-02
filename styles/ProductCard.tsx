import { StyleSheet } from "react-native";

const CardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    width: 180,
    margin: 10,
  },

  productImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginVertical: 10,
    borderRadius: 10,
  },

  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },

  priceContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },

  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  originalPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#7f8c8d",
    marginLeft: 5,
  },

  button: {
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderRadius: 5,
    marginTop: 10,
  },

  buttonText: {
    color: "#111",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CardStyles