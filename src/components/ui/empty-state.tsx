import { View } from "react-native";
import { colors } from "@/lib/theme";
import { Display, Sans } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  body,
  href = "/shop",
  cta = "Start browsing",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 96 }}>
      <View
        style={{
          marginBottom: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.beige,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <Display size={24} align="center">
        {title}
      </Display>
      <Sans size={14} leading="relaxed" color={colors.muted} align="center" style={{ marginTop: 12, maxWidth: 384 }}>
        {body}
      </Sans>
      <Button href={href} style={{ marginTop: 32, alignSelf: "center" }}>
        {cta}
      </Button>
    </View>
  );
}
