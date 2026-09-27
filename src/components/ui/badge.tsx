import { View } from "react-native";
import { colors } from "@/lib/theme";
import { Eyebrow } from "@/components/ui/text";

const tones = {
  new: { bg: colors.charcoal, text: colors.white, border: "transparent" },
  bestseller: { bg: colors.gold, text: colors.charcoal, border: "transparent" },
  limited: { bg: colors.white, text: colors.charcoal, border: "rgba(26,26,26,0.2)" },
  sale: { bg: colors.sale, text: colors.white, border: "transparent" },
} as const;

const labels = {
  new: "New in",
  bestseller: "Bestseller",
  limited: "Limited edition",
  sale: "Sale",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof tones; children?: string }) {
  const t = tones[tone];
  return (
    <View
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Eyebrow size={9} color={t.text} weight="medium">
        {children ?? labels[tone]}
      </Eyebrow>
    </View>
  );
}
