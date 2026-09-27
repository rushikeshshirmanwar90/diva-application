import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/lib/theme";
import { MODEL } from "@/lib/images";
import { Logo } from "@/components/layout/logo";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/link";
import { Container } from "@/components/layout/page";

/**
 * The sign-in / register frame. The site shows its "Diva Circle" panel beside
 * the form from `lg`; on a phone it becomes a band above it.
 */
export function AuthShell({
  image = MODEL.pearlShirt,
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  image?: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <View>
      <View style={{ height: 220, backgroundColor: colors.charcoal, overflow: "hidden" }}>
        <Image source={{ uri: image }} style={{ width: "100%", height: "100%", opacity: 0.8 }} contentFit="cover" />
        <LinearGradient colors={["rgba(26,26,26,0)", "rgba(26,26,26,0.85)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24 }}>
          <Sans size={10} color={colors.goldLight} uppercase tracking={0.3}>
            Diva Circle
          </Sans>
          <Display size={22} leading="snug" color={colors.white} style={{ marginTop: 8, maxWidth: 384 }}>
            Members get first look at limited runs and priority bridal appointments.
          </Display>
        </View>
      </View>

      <Container style={{ paddingVertical: 48 }}>
        <View style={{ maxWidth: 384 }}>
          <Logo width={120} />
          <Eyebrow style={{ marginTop: 40 }}>{eyebrow}</Eyebrow>
          <Display size={30} style={{ marginTop: 12 }}>
            {title}
          </Display>
          <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 12 }}>
            {intro}
          </Sans>

          <View style={{ marginTop: 36 }}>{children}</View>

          <View style={{ marginTop: 32 }}>{footer}</View>

          <Sans size={10} leading="relaxed" color="rgba(122,115,108,0.8)" style={{ marginTop: 40 }}>
            By continuing you agree to Diva’s terms and{" "}
            <InlineLink href="/policies/privacy">
              <Sans size={10} color={colors.goldText}>
                privacy policy
              </Sans>
            </InlineLink>
            .
          </Sans>
        </View>
      </Container>
    </View>
  );
}
