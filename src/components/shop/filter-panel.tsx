import { useState } from "react";
import { Pressable, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useCatalogue, useCategories } from "@/lib/data/catalogue-context";
import type { Category, Product } from "@/lib/types";
import { facetCounts, priceBands, type FacetKey, type FilterState } from "@/lib/filters";
import { Eyebrow, Sans } from "@/components/ui/text";
import { occasionNames } from "@/lib/data/occasions";

type Group = {
  key: FacetKey;
  label: string;
  options: { value: string; label: string }[];
};

function distinct(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

/** Finish and stone options come from the catalogue, not a fixed list. */
export function buildGroups(includeCategory: boolean, categories: Category[], pool: Product[]): Group[] {
  const metalOptions = distinct(pool.map((product) => product.attributes.metal));
  const stoneOptions = distinct(pool.map((product) => product.attributes.stone));

  const groups: Group[] = [
    { key: "price", label: "Price", options: priceBands.map((b) => ({ value: b.key, label: b.label })) },
  ];

  if (includeCategory) {
    groups.push({ key: "category", label: "Category", options: categories.map((c) => ({ value: c.slug, label: c.name })) });
  }

  if (metalOptions.length > 0) {
    groups.push({ key: "metal", label: "Finish", options: metalOptions.map((m) => ({ value: m, label: m })) });
  }

  if (stoneOptions.length > 0) {
    groups.push({
      key: "stone",
      label: "Stone",
      options: stoneOptions.map((s) => ({ value: s, label: s === "None" ? "No stone" : s })),
    });
  }

  groups.push(
    { key: "occasion", label: "Occasion", options: occasionNames.map((o) => ({ value: o, label: o })) },
    {
      key: "gender",
      label: "Wearer",
      options: [
        { value: "Women", label: "Women" },
        { value: "Men", label: "Men" },
        { value: "Unisex", label: "Unisex" },
      ],
    },
    {
      key: "availability",
      label: "Availability",
      options: [
        { value: "in-stock", label: "Ready to ship" },
        { value: "made-to-order", label: "Made to order" },
      ],
    },
    {
      key: "rating",
      label: "Customer rating",
      options: [
        { value: "4", label: "4.0 & above" },
        { value: "4.5", label: "4.5 & above" },
      ],
    },
  );

  return groups;
}

export function FilterPanel({
  basePool,
  state,
  onToggle,
  includeCategory,
}: {
  basePool: Product[];
  state: FilterState;
  onToggle: (key: FacetKey, value: string) => void;
  includeCategory: boolean;
}) {
  const categories = useCategories();
  const pool = useCatalogue();
  const groups = buildGroups(includeCategory, categories, pool);
  const [collapsed, setCollapsed] = useState<Set<FacetKey>>(() => new Set());

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
      {groups.map((group) => {
        const counts = facetCounts(basePool, state, group.key);
        const visible = group.options.filter((o) => (counts[o.value] ?? 0) > 0);
        if (visible.length === 0) return null;
        const open = !collapsed.has(group.key);

        return (
          <View key={group.key} style={{ borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() =>
                setCollapsed((current) => {
                  const next = new Set(current);
                  if (next.has(group.key)) next.delete(group.key);
                  else next.add(group.key);
                  return next;
                })
              }
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}
            >
              <Eyebrow color={colors.ink}>{group.label}</Eyebrow>
              <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
                <ChevronDown size={16} color={colors.gold} />
              </View>
            </Pressable>
            {open ? (
              <View style={{ gap: 10, paddingBottom: 20 }}>
                {visible.map((option) => {
                  const checked = state[group.key].includes(option.value);
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      onPress={() => onToggle(group.key, option.value)}
                      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.7 : 1 })}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderWidth: 1,
                          borderColor: checked ? colors.gold : colors.line,
                          backgroundColor: checked ? colors.gold : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {checked ? <Check size={11} strokeWidth={3} color={colors.white} /> : null}
                      </View>
                      <Sans size={14} color={checked ? colors.ink : colors.muted} style={{ flex: 1 }}>
                        {option.label}
                      </Sans>
                      <Sans size={10} color="rgba(122,115,108,0.7)">
                        {counts[option.value]}
                      </Sans>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
