// react-native-image-slider-box.d.ts

declare module "react-native-image-slider-box" {
  import * as React from "react";
  import { ImageSourcePropType } from "react-native";

  interface SliderBoxProps {
    images?: Array<string | number>;
    currentImageEmitter?: (index: number) => void;
    // Add any other props you might need
  }

  export class SliderBox extends React.Component<SliderBoxProps> {}
}
