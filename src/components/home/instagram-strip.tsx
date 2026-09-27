import { View } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/lib/theme";
import { MODEL, STILL } from "@/lib/images";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Container } from "@/components/layout/page";

const feed = [
  { image: MODEL.layeredNecklaces, likes: "2,418" },
  { image: STILL.hoopsOnDish, likes: "1,902" },
  { image: MODEL.coinPendant, likes: "3,275" },
  { image: STILL.templeSet, likes: "5,640" },
  { image: MODEL.ringAndPendant, likes: "2,061" },
  { image: STILL.tennisBracelet, likes: "1,744" },
];

export function InstagramStrip() {
  return (
    <Container style={{ paddingVertical: 80 }}>
      <View style={{ alignItems: "center" }}>
        <Eyebrow style={{ marginBottom: 12 }}>@divajewellery</Eyebrow>
        <Display size={30} leading="tight" align="center">
          #DivaOnYou
        </Display>
        <Sans size={14} color={colors.muted} align="center" style={{ marginTop: 12, maxWidth: 512 }}>
          Tag us and we may feature you. We repost with permission, always.
        </Sans>
      </View>

      <View style={{ marginTop: 48, flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
        {feed.map((post, i) => (
          <View key={i} style={{ width: "50%", padding: 4 }}>
            <View style={{ aspectRatio: 1, backgroundColor: colors.beige, overflow: "hidden" }}>
              <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          </View>
        ))}
      </View>
    </Container>
  );
}
