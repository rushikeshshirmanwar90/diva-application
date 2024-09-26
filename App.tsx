import React from "react";
import * as Font from "expo-font";
import {  Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigator from "./components/Navigation/Navigator";

interface State {
  isFontLoaded: boolean;
}

export default class App extends React.Component<{}, State> {
  state: State = {
    isFontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      Bold: require("./assets/fonts/Montserrat-ExtraBold.otf"),
      Medium: require("./assets/fonts/Montserrat-Medium.otf"),
      Regular: require("./assets/fonts/Montserrat-Regular.otf"),
    });
    this.setState({ isFontLoaded: true });
  }

  render() {
    return this.state.isFontLoaded ? (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigator />
      </GestureHandlerRootView>
    ) : (
      <Text style={styles.center}>Loading...</Text>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
