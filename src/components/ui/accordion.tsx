import { useState } from "react";
import { Pressable, View } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { Display, Sans } from "@/components/ui/text";

/** The site's `<details>` accordion: hairline dividers, a gold plus that turns into a cross. */
export function Accordion({
  items,
  defaultOpenFirst = false,
}: {
  items: { q: string; a: React.ReactNode }[];
  defaultOpenFirst?: boolean;
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpenFirst ? [0] : []));

  const toggle = (i: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <View
            key={item.q}
            style={{ borderTopWidth: i === 0 ? 0 : 1, borderColor: colors.line, paddingHorizontal: 4, paddingVertical: 4 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => toggle(i)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 24, paddingVertical: 20 }}
            >
              <Display size={18} style={{ flex: 1 }}>
                {item.q}
              </Display>
              <View style={{ transform: [{ rotate: isOpen ? "45deg" : "0deg" }] }}>
                <Plus size={16} color={colors.gold} />
              </View>
            </Pressable>
            {isOpen ? (
              <View style={{ paddingBottom: 24, paddingRight: 40 }}>
                {typeof item.a === "string" ? (
                  <Sans size={14} leading="relaxed" color={colors.muted}>
                    {item.a}
                  </Sans>
                ) : (
                  item.a
                )}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
