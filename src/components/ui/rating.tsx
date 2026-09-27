import { View } from "react-native";
import { Star } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

export function Rating({
  value,
  count,
  size = 13,
  textColor = colors.muted,
}: {
  value: number;
  count?: number;
  size?: number;
  textColor?: string;
}) {
  return (
    <View
      accessibilityLabel={`Rated ${value} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
    >
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              strokeWidth={1.5}
              color={filled ? colors.gold : colors.line}
              fill={filled ? colors.gold : "transparent"}
            />
          );
        })}
      </View>
      <Sans size={12} color={textColor}>
        {value.toFixed(1)}
        {count !== undefined ? ` (${count})` : ""}
      </Sans>
    </View>
  );
}
