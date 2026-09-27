import { View } from "react-native";
import { discountPercent, formatPaise } from "@/lib/format";
import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

export function Price({
  price,
  mrp,
  size = "md",
}: {
  price: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
}) {
  const off = mrp ? discountPercent(price, mrp) : 0;
  const scale = { sm: 14, md: 16, lg: 24 }[size];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
      <Sans size={scale} weight="medium" color={colors.ink}>
        {formatPaise(price)}
      </Sans>
      {mrp && off > 0 ? (
        <>
          <Sans size={12} color={colors.muted} strike>
            {formatPaise(mrp)}
          </Sans>
          <Sans size={12} weight="medium" color={colors.sale}>
            {off}% off
          </Sans>
        </>
      ) : null}
    </View>
  );
}
