// react-native-image-slider-box.d.ts

declare module "react-native-image-slider-box" {
  import * as React from "react";
  import { ImageSourcePropType } from "react-native";

  interface SliderBoxProps {
    images?: Array<string | number | ImageSourcePropType>;
    currentImageEmitter?: (index: number) => void;
    autoplay?: boolean;
    circleLoop?: boolean;
    resizeMethod?: "resize" | "cover" | "contain";
    resizeMode?: "cover" | "contain" | "stretch" | "center";
    dotColor?: string;
    inactiveDotColor?: string;
    paginationBoxVerticalPadding?: number;
    paginationBoxStyle?: object;
    dotStyle?: object;
    onCurrentImagePressed?: (index: number) => void;
  }

  declare const SliderBox: React.ComponentClass<SliderBoxProps> & {
    ImageComponent?: React.ComponentType<any>;
    ImageComponentStyle?: object;
  };

  export default SliderBox;
}
