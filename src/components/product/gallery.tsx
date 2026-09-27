import { useRef, useState } from "react";
import { FlatList, Pressable, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Image } from "expo-image";
import { Expand, Play } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import { cdnImage, IMG } from "@/lib/images";
import { toYouTubeEmbedUrl, toYouTubeThumbnail } from "@/lib/youtube";
import { Eyebrow } from "@/components/ui/text";
import { VideoEmbed } from "@/components/product/video-embed";

/**
 * The product gallery: a swipeable 4:5 carousel with a tap-to-zoom, and the
 * thumbnails beneath it (the site's `flex-col-reverse` below `lg`). A video
 * thumbnail swaps the carousel for the YouTube short.
 */
export function Gallery({ images, title, videoUrl }: { images: string[]; title: string; videoUrl?: string | null }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [width, setWidth] = useState(0);
  const listRef = useRef<FlatList<string>>(null);

  const embedUrl = toYouTubeEmbedUrl(videoUrl);
  const videoThumbnail = toYouTubeThumbnail(videoUrl) || images[0];
  const hasVideo = Boolean(embedUrl);
  const isVideo = showVideo && hasVideo;

  const showImage = (index: number) => {
    setShowVideo(false);
    setZoomed(false);
    setImageIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const openVideo = () => {
    setShowVideo(true);
    setZoomed(false);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    setZoomed(false);
  };

  return (
    <View style={{ gap: 16 }}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
        {isVideo && embedUrl ? (
          <View style={{ aspectRatio: 4 / 5, width: "100%", backgroundColor: colors.charcoal, overflow: "hidden" }}>
            <VideoEmbed embedUrl={embedUrl} title={`${title} video short`} autoplay />
          </View>
        ) : (
          <View>
            {width > 0 ? (
              <FlatList
                ref={listRef}
                data={images}
                keyExtractor={(image, i) => image + i}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumEnd}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                // Only the slide on screen and its neighbour decode when the
                // page opens. Six 1200px images arriving in one go is a
                // memory spike and a burst of decode work exactly when the
                // screen is trying to settle.
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={3}
                renderItem={({ item, index }) => (
                  <Pressable
                    accessibilityRole="imagebutton"
                    accessibilityLabel={zoomed ? "Tap to shrink" : "Tap to zoom"}
                    onPress={() => setZoomed((z) => !z)}
                    style={{ width, aspectRatio: 4 / 5, backgroundColor: colors.beige, overflow: "hidden" }}
                  >
                    <Image
                      source={{ uri: item }}
                      accessibilityLabel={title}
                      contentFit="cover"
                      // The first slide is what the shopper is waiting for.
                      priority={index === 0 ? "high" : "normal"}
                      transition={150}
                      style={{ width: "100%", height: "100%", transform: [{ scale: zoomed && imageIndex === index ? 1.7 : 1 }] }}
                    />
                  </Pressable>
                )}
              />
            ) : (
              <View style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: colors.beige }} />
            )}

            {hasVideo ? (
              <Pressable
                accessibilityRole="button"
                onPress={openVideo}
                style={({ pressed }) => [
                  {
                    position: "absolute",
                    top: 16,
                    left: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    backgroundColor: pressed ? colors.gold : "rgba(26,26,26,0.85)",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  },
                  shadow.md,
                ]}
              >
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" }}>
                  <Play size={9} color={colors.white} fill={colors.white} style={{ marginLeft: 1 }} />
                </View>
                <Eyebrow size={10} color={colors.white}>
                  Watch Short
                </Eyebrow>
              </Pressable>
            ) : null}

            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 16,
                bottom: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,255,255,0.85)",
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Expand size={12} color={colors.charcoal} />
              <Eyebrow size={10} color={colors.charcoal}>
                {zoomed ? "Tap to shrink" : images.length > 1 ? `${imageIndex + 1} / ${images.length}` : "Tap to zoom"}
              </Eyebrow>
            </View>
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {images.map((image, i) => {
          const current = !isVideo && imageIndex === i;
          return (
            <Pressable
              key={image + i}
              accessibilityLabel={`View image ${i + 1}`}
              accessibilityState={{ selected: current }}
              onPress={() => showImage(i)}
              style={{
                width: 80,
                height: 80,
                backgroundColor: colors.beige,
                overflow: "hidden",
                opacity: current ? 1 : 0.7,
                borderWidth: current ? 1 : 0,
                borderColor: colors.gold,
              }}
            >
              <Image source={{ uri: cdnImage(image, IMG.icon) }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </Pressable>
          );
        })}

        {hasVideo ? (
          <Pressable
            accessibilityLabel="View product video short"
            accessibilityState={{ selected: isVideo }}
            onPress={openVideo}
            style={{
              width: 80,
              height: 80,
              backgroundColor: colors.charcoal,
              overflow: "hidden",
              opacity: isVideo ? 1 : 0.8,
              borderWidth: isVideo ? 1 : 0,
              borderColor: colors.gold,
            }}
          >
            {videoThumbnail ? (
              <Image source={{ uri: videoThumbnail }} style={{ width: "100%", height: "100%", opacity: 0.6 }} contentFit="cover" />
            ) : null}
            <View
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" }}>
                <Play size={12} color={colors.white} fill={colors.white} style={{ marginLeft: 2 }} />
              </View>
              <Eyebrow size={9} color={colors.white} weight="medium">
                Video
              </Eyebrow>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
