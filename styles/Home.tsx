import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  headerContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 50,
    alignItems: "center",
  },

  logo: {
    fontSize: 30,
  },

  MainSearchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 30,
  },

  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    width: "100%",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    height: 35,
    borderRadius: 10,
    marginLeft: 1,
  },

  searchInput: {
    fontFamily: "Medium",
    paddingHorizontal: 10,
    fontSize: 12,
  },
});
