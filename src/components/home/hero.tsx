import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "@/lib/theme";
import { MODEL } from "@/lib/images";
import type { HeroSlide } from "@/lib/types";
import { Display, Sans } from "@/components/ui/text";
import { useNavigate } from "@/components/ui/link";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

/** Shown when the admin has not added any hero slides yet. */
const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  heading: "Gold that outlives\nthe occasion",
  subtitle: "Hallmarked 22K and 18K jewellery, hand-finished in Bengaluru and Jaipur.",
  image: MODEL.layeredOlive,
  imageAlt: "Layered gold chains worn with an olive silk dress",
  cta: { label: "Shop the collection", href: "/shop" },
};

/**
 * The hero at the site's mobile breakpoint: a 2:1 banner, exactly as tall as
 * the artwork, with the copy pinned to the bottom-left over a charcoal band
 * and the dots bottom-right. Autoplays every 6s when there is more than one.
 */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const items = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const multi = items.length > 1;
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<HeroSlide>>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!multi) return;
    const timer = setInterval(() => {
      const next = (active + 1) % items.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActive(next);
    }, 6000);
    return () => clearInterval(timer);
  }, [active, items.length, multi]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ backgroundColor: colors.charcoal, overflow: "hidden" }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={multi}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => <HeroSlideContent slide={item} width={width} />}
      />

      {multi ? (
        <View style={{ position: "absolute", right: 20, bottom: 16, flexDirection: "row", gap: 8 }}>
          {items.map((slide, index) => (
            <Pressable
              key={slide.id}
              accessibilityLabel={`Go to slide ${index + 1}`}
              hitSlop={6}
              onPress={() => {
                listRef.current?.scrollToIndex({ index, animated: true });
                setActive(index);
              }}
              style={{
                height: 6,
                width: index === active ? 24 : 6,
                borderRadius: 3,
                backgroundColor: index === active ? colors.gold : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The hero's loading shape — the same 2:1 charcoal banner, with the heading
 * line and CTA pill where the copy lands and three dots where the pager sits,
 * so the real slide arrives without the page moving.
 */
export function HeroSkeleton() {
  return (
    <SkeletonGroup label="Loading banner" style={{ backgroundColor: colors.charcoal, overflow: "hidden" }}>
      <Skeleton dark style={{ width: "100%", aspectRatio: 2 }} />

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Skeleton dark style={{ height: 14, width: "58%", maxWidth: 336 }} />
        <Skeleton style={{ marginTop: 8, height: 32, width: 144, backgroundColor: "rgba(201,162,39,0.35)" }} />
      </View>

      <View style={{ position: "absolute", right: 20, bottom: 16, flexDirection: "row", gap: 8 }}>
        <View style={{ height: 6, width: 24, borderRadius: 3, backgroundColor: "rgba(201,162,39,0.5)" }} />
        <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" }} />
        <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" }} />
      </View>
    </SkeletonGroup>
  );
}

function HeroSlideContent({ slide, width }: { slide: HeroSlide; width: number }) {
  const navigate = useNavigate();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${slide.heading.replace(/\s+/g, " ").trim()} — ${slide.cta.label}`}
      onPress={() => navigate(slide.cta.href)}
      style={{ width, aspectRatio: 2 }}
    >
      {({ pressed }) => (
        <>
          {/* `object-contain`: the banner is never cropped; anything not 2:1 gets charcoal side bars. */}
          <Image source={{ uri: slide.image }} style={{ width: "100%", height: "100%" }} contentFit="contain" accessibilityLabel={slide.imageAlt} />

          {/* One scrim: holds ~0.9 to the 60% mark and only releases above the copy. */}
          <LinearGradient
            colors={["rgba(26,26,26,0)", "rgba(26,26,26,0.6)", "rgba(26,26,26,0.9)", "rgba(26,26,26,0.96)"]}
            locations={[0, 0.2, 0.4, 1]}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" }}
          />

          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 16 }}>
            <View style={{ maxWidth: 576 }}>
              <Display size={18} leading="tight" color={colors.white} numberOfLines={2}>
                {slide.heading.replace(/\n/g, " ")}
              </Display>
              <View style={{ marginTop: 8, flexDirection: "row" }}>
                <View style={{ backgroundColor: pressed ? colors.goldDark : colors.gold, paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Sans size={11} color={colors.charcoal} uppercase tracking={0.14} style={{ fontFamily: fonts.sans.medium }}>
                    {slide.cta.label}
                  </Sans>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}
