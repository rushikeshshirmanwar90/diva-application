import { View } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/lib/theme";
import { STILL } from "@/lib/images";
import { Display, Sans } from "@/components/ui/text";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Container } from "@/components/layout/page";

export function NewsletterBand() {
  return (
    <View style={{ backgroundColor: colors.charcoal, overflow: "hidden" }}>
      <Image
        source={{ uri: STILL.hangingPendants }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.25 }}
        contentFit="cover"
      />
      <Container style={{ paddingVertical: 80 }}>
        <View style={{ maxWidth: 576 }}>
          <Sans size={10} color={colors.goldLight} uppercase tracking={0.32}>
            One letter a month
          </Sans>
          <Display size={30} leading="tight" color={colors.white} style={{ marginTop: 16 }}>
            New pieces, gold-rate notes,{"\n"}and nothing else
          </Display>
          <Sans size={14} leading="relaxed" color="rgba(255,255,255,0.65)" style={{ marginTop: 16 }}>
            First look at limited runs, plus a monthly note on where the gold rate has moved and what that means if you
            are saving for something. Unsubscribe in one click.
          </Sans>
          <NewsletterForm dark style={{ marginTop: 32 }} />
        </View>
      </Container>
    </View>
  );
}
