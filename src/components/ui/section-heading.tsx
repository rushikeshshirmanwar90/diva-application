import { View, type StyleProp, type ViewStyle } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "center",
  style,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "center" | "left" | "between";
  style?: StyleProp<ViewStyle>;
}) {
  const centered = align === "center";

  const heading = (
    <View style={{ maxWidth: 672, alignItems: centered ? "center" : "flex-start", flexShrink: 1 }}>
      {eyebrow ? (
        <Eyebrow align={centered ? "center" : "left"} style={{ marginBottom: 12 }}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Display size={30} leading="tight" align={centered ? "center" : "left"}>
        {title}
      </Display>
      {description ? (
        <Sans size={14} leading="relaxed" color={colors.muted} align={centered ? "center" : "left"} style={{ marginTop: 12 }}>
          {description}
        </Sans>
      ) : null}
    </View>
  );

  const link = href ? (
    <Link href={href} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Eyebrow color={colors.charcoal}>{linkLabel}</Eyebrow>
      <ArrowRight size={14} color={colors.charcoal} />
    </Link>
  ) : null;

  if (align === "between") {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
            paddingBottom: 24,
          },
          style,
        ]}
      >
        {heading}
        {link}
      </View>
    );
  }

  return (
    <View style={[{ alignItems: centered ? "center" : "flex-start" }, style]}>
      {heading}
      {link ? <View style={{ marginTop: 20 }}>{link}</View> : null}
    </View>
  );
}
