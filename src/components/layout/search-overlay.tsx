import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Search, X } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { cdnImage, IMG } from "@/lib/images";
import { useCategories, useProductSearch } from "@/lib/data/catalogue-context";
import { useStoreActions, useStoreUI } from "@/lib/store/store";
import { formatPaise } from "@/lib/format";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link, useNavigate } from "@/components/ui/link";
import { IconButton } from "@/components/ui/icon-button";

const suggestions = [
  "Solitaire ring",
  "Gold hoops",
  "Polki",
  "Mangalsutra",
  "Tennis bracelet",
  "Pendant under 30000",
];

/** Full-screen search — the site's `SearchOverlay`. */
export function SearchOverlay() {
  const { searchOpen } = useStoreUI();
  const { setSearchOpen } = useStoreActions();
  if (!searchOpen) return null;
  return <SearchPanel onClose={() => setSearchOpen(false)} />;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const categories = useCategories();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const matches = useProductSearch(query);
  const results = useMemo(() => matches.slice(0, 6), [matches]);

  const submit = () => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 60, backgroundColor: colors.white }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        >
          <View
            style={{
              height: 48,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(230,224,215,0.6)",
              paddingBottom: 12,
            }}
          >
            <Eyebrow>Search Diva</Eyebrow>
            <IconButton label="Close search" onPress={onClose} size={40}>
              <X size={20} strokeWidth={1.5} color={colors.charcoal} />
            </IconButton>
          </View>

          <View
            style={{
              marginTop: 32,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.charcoal,
              paddingBottom: 16,
            }}
          >
            <Search size={22} strokeWidth={1.4} color={colors.gold} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submit}
              returnKeyType="search"
              autoCorrect={false}
              placeholder="Try “diamond pendant” or “22K hoops”"
              placeholderTextColor="rgba(122,115,108,0.6)"
              style={{ flex: 1, fontFamily: fonts.display.light, fontSize: 24, color: colors.ink, paddingVertical: 0 }}
            />
          </View>

          {!query ? (
            <View style={{ marginTop: 40, gap: 40 }}>
              <View>
                <Eyebrow style={{ marginBottom: 16 }}>Popular searches</Eyebrow>
                <View style={{ gap: 10 }}>
                  {suggestions.map((s) => (
                    <Pressable key={s} onPress={() => setQuery(s)} style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.6 : 1 })}>
                      <Sans size={14} color={colors.charcoal}>
                        {s}
                      </Sans>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View>
                <Eyebrow style={{ marginBottom: 16 }}>Browse categories</Eyebrow>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {categories.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}`} style={{ width: "50%", paddingVertical: 5 }}>
                      <Sans size={14} color={colors.charcoal}>
                        {c.name}
                      </Sans>
                    </Link>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 32 }}>
              <Eyebrow style={{ marginBottom: 16 }}>
                {results.length > 0
                  ? `${results.length} matching piece${results.length === 1 ? "" : "s"}`
                  : "No matches — try a metal, stone or category"}
              </Eyebrow>
              <View>
                {results.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      paddingVertical: 12,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: colors.line,
                    }}
                  >
                    <View style={{ width: 64, height: 64, backgroundColor: colors.beige, overflow: "hidden" }}>
                      {p.images[0] ? <Image source={{ uri: cdnImage(p.images[0], IMG.thumb) }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Display size={16} weight="regular" numberOfLines={1}>
                        {p.title}
                      </Display>
                      <Sans size={12} color={colors.muted} numberOfLines={1}>
                        {p.subtitle}
                      </Sans>
                    </View>
                    <Sans size={14}>{formatPaise(p.price)}</Sans>
                  </Link>
                ))}
              </View>
              {results.length > 0 ? (
                <Link href={`/search?q=${encodeURIComponent(query)}`} style={{ marginTop: 24, alignSelf: "flex-start" }}>
                  <Eyebrow color={colors.charcoal}>See all results</Eyebrow>
                </Link>
              ) : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
