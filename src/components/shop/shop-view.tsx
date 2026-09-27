import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import type { Category, Product } from "@/lib/types";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  priceBands,
  sortOptions,
  type FacetKey,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { useCategories } from "@/lib/data/catalogue-context";
import { FilterPanel } from "@/components/shop/filter-panel";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { IconButton } from "@/components/ui/icon-button";
import { Container } from "@/components/layout/page";

const PAGE_SIZE = 8;

function labelFor(key: FacetKey, value: string, categories: Category[]) {
  if (key === "price") return priceBands.find((b) => b.key === value)?.label ?? value;
  if (key === "category") return categories.find((c) => c.slug === value)?.name ?? value;
  if (key === "availability") return value === "in-stock" ? "Ready to ship" : "Made to order";
  if (key === "rating") return `${value} & above`;
  return value;
}

/** The catalogue: count + Filter / Sort row, active chips, the grid, "Load more", and the filter sheet. */
export function ShopView({
  pool,
  initialFilters,
  includeCategory = true,
}: {
  pool: Product[];
  initialFilters: FilterState;
  includeCategory?: boolean;
}) {
  const categories = useCategories();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<FilterState>(initialFilters);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const results = useMemo(() => applyFilters(pool, state), [pool, state]);
  const activeCount = activeFilterCount(state);

  const toggle = (key: FacetKey, value: string) => {
    setVisible(PAGE_SIZE);
    setState((prev) => {
      const current = prev[key];
      return { ...prev, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const clearAll = () => {
    setVisible(PAGE_SIZE);
    setState({ ...emptyFilters, sort: state.sort });
  };

  const chips = (Object.keys(state) as (keyof FilterState)[]).flatMap((key) =>
    key === "sort" ? [] : (state[key] as string[]).map((value) => ({ key: key as FacetKey, value })),
  );

  const sortLabel = sortOptions.find((o) => o.key === state.sort)?.label ?? "Featured";

  return (
    <Container>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          paddingBottom: 16,
        }}
      >
        <Sans size={12} color={colors.muted}>
          <Sans size={12}>{results.length}</Sans> {results.length === 1 ? "piece" : "pieces"}
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} applied` : ""}
        </Sans>

        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDrawerOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <SlidersHorizontal size={13} color={colors.charcoal} />
            <Eyebrow size={10} color={colors.charcoal}>
              Filter
            </Eyebrow>
            {activeCount > 0 ? (
              <View style={{ marginLeft: 4, borderRadius: 999, backgroundColor: colors.gold, paddingHorizontal: 6 }}>
                <Sans size={9} color={colors.white}>
                  {activeCount}
                </Sans>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort: ${sortLabel}`}
            onPress={() => setSortOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Eyebrow size={10}>Sort</Eyebrow>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Sans size={11}>{sortLabel}</Sans>
              <ChevronDown size={12} color={colors.muted} />
            </View>
          </Pressable>
        </View>
      </View>

      {chips.length > 0 ? (
        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {chips.map((chip) => (
            <Pressable
              key={`${chip.key}-${chip.value}`}
              onPress={() => toggle(chip.key, chip.value)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: pressed ? colors.beigeDark : colors.beige,
                paddingHorizontal: 12,
                paddingVertical: 6,
              })}
            >
              <Sans size={12} color={colors.charcoal}>
                {labelFor(chip.key, chip.value, categories)}
              </Sans>
              <X size={11} color={colors.charcoal} />
            </Pressable>
          ))}
          <Pressable onPress={clearAll} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Sans size={12} color={colors.goldText}>
              Clear all
            </Sans>
          </Pressable>
        </View>
      ) : null}

      {results.length === 0 ? (
        <View style={{ paddingVertical: 96, alignItems: "center" }}>
          <Display size={24} align="center">
            Nothing matches all of those filters
          </Display>
          <Sans size={14} color={colors.muted} align="center" style={{ marginTop: 12 }}>
            Try removing the price band, or widening the metal choice.
          </Sans>
          {/* `Button` pins itself to flex-start; centre it explicitly. */}
          <Button variant="outline" style={{ marginTop: 28, alignSelf: "center" }} onPress={clearAll}>
            Clear all filters
          </Button>
        </View>
      ) : (
        <>
          <ProductGrid products={results.slice(0, visible)} style={{ marginTop: 40 }} />
          {visible < results.length ? (
            <View style={{ marginTop: 16, alignItems: "center", gap: 16 }}>
              <Eyebrow>
                Showing {Math.min(visible, results.length)} of {results.length}
              </Eyebrow>
              <View style={{ height: 1, width: 160, backgroundColor: colors.line }}>
                <View style={{ height: "100%", backgroundColor: colors.gold, width: `${(visible / results.length) * 100}%` }} />
              </View>
              <Button variant="outline" size="lg" style={{ alignSelf: "center" }} onPress={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more
              </Button>
            </View>
          ) : null}
        </>
      )}

      {/* Filter drawer */}
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={() => setDrawerOpen(false)}>
        <View style={{ flex: 1 }}>
          <Animated.View entering={FadeIn.duration(300)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            <Pressable accessibilityLabel="Close filters" onPress={() => setDrawerOpen(false)} style={{ flex: 1, backgroundColor: "rgba(26,26,26,0.5)" }} />
          </Animated.View>
          <Animated.View
            entering={SlideInLeft.duration(400)}
            style={[{ position: "absolute", top: 0, bottom: 0, left: 0, width: "88%", maxWidth: 384, backgroundColor: colors.white }, shadow.xl]}
          >
            <View
              style={{
                paddingTop: insets.top + 16,
                paddingBottom: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <Display size={20}>Refine</Display>
              <IconButton label="Close filters" onPress={() => setDrawerOpen(false)}>
                <X size={19} strokeWidth={1.5} color={colors.charcoal} />
              </IconButton>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}>
              <FilterPanel basePool={pool} state={state} onToggle={toggle} includeCategory={includeCategory} />
            </ScrollView>
            <View
              style={{ flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 16 }}
            >
              <Button variant="outline" style={{ flex: 1 }} onPress={clearAll}>
                Clear all
              </Button>
              <Button style={{ flex: 1 }} onPress={() => setDrawerOpen(false)}>
                {`Show ${results.length}`}
              </Button>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Sort sheet — stands in for the site's <select>. */}
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable onPress={() => setSortOpen(false)} style={{ flex: 1, backgroundColor: "rgba(26,26,26,0.5)", justifyContent: "flex-end" }}>
          <Pressable style={{ backgroundColor: colors.white, paddingBottom: insets.bottom }}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Eyebrow>Sort by</Eyebrow>
            </View>
            {sortOptions.map((o) => {
              const active = o.key === state.sort;
              return (
                <Pressable
                  key={o.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setVisible(PAGE_SIZE);
                    setState((p) => ({ ...p, sort: o.key as SortKey }));
                    setSortOpen(false);
                  }}
                  style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 14, backgroundColor: pressed ? colors.beige : "transparent" })}
                >
                  <Sans size={14} color={active ? colors.gold : colors.charcoal}>
                    {o.label}
                  </Sans>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </Container>
  );
}
