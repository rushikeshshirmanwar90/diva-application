import { View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

export function Breadcrumbs({
  trail,
  onDark = false,
}: {
  trail: { label: string; href?: string }[];
  onDark?: boolean;
}) {
  const linkColor = onDark ? "rgba(255,255,255,0.6)" : colors.muted;
  const currentColor = onDark ? colors.white : colors.ink;
  const chevron = onDark ? "rgba(255,255,255,0.3)" : colors.line;

  return (
    <View accessibilityRole="header" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      <Link href="/">
        <Sans size={11} color={linkColor} tracking={0.025}>
          Home
        </Sans>
      </Link>
      {trail.map((item) => (
        <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <ChevronRight size={12} color={chevron} />
          {item.href ? (
            <Link href={item.href}>
              <Sans size={11} color={linkColor} tracking={0.025}>
                {item.label}
              </Sans>
            </Link>
          ) : (
            <Sans size={11} color={currentColor} tracking={0.025}>
              {item.label}
            </Sans>
          )}
        </View>
      ))}
    </View>
  );
}
