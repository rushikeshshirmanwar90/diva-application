import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/lib/theme";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Container } from "@/components/layout/page";

export function PageHeader({
  eyebrow,
  title,
  description,
  trail,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  trail: { label: string; href?: string }[];
  image?: string;
}) {
  if (image) {
    return (
      <View style={{ marginBottom: 48, minHeight: 416, backgroundColor: colors.charcoal, overflow: "hidden" }}>
        <Image source={{ uri: image }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.7 }} contentFit="cover" />
        <LinearGradient
          colors={["rgba(26,26,26,0.2)", "rgba(26,26,26,0.4)", "rgba(26,26,26,0.9)"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <Container style={{ minHeight: 416, justifyContent: "flex-end", paddingVertical: 48 }}>
          <Breadcrumbs trail={trail} onDark />
          {eyebrow ? (
            <Sans size={10} color={colors.goldLight} uppercase tracking={0.32} style={{ marginTop: 24 }}>
              {eyebrow}
            </Sans>
          ) : null}
          <Display size={36} leading="tight" color={colors.white} style={{ marginTop: 12, maxWidth: 672 }}>
            {title}
          </Display>
          {description ? (
            <Sans size={14} leading="relaxed" color="rgba(255,255,255,0.7)" style={{ marginTop: 16, maxWidth: 576 }}>
              {description}
            </Sans>
          ) : null}
        </Container>
      </View>
    );
  }

  return (
    <Container style={{ marginBottom: 48, paddingTop: 32 }}>
      <Breadcrumbs trail={trail} />
      {eyebrow ? <Eyebrow style={{ marginTop: 24 }}>{eyebrow}</Eyebrow> : null}
      <Display size={36} leading="tight" style={{ marginTop: 12 }}>
        {title}
      </Display>
      {description ? (
        <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 16, maxWidth: 672 }}>
          {description}
        </Sans>
      ) : null}
    </Container>
  );
}
