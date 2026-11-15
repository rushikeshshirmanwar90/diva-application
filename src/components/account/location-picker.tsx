import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Linking, Platform, Pressable, TextInput, View } from "react-native";
import { ChevronRight, LocateFixed, MapPin, Plus, Search, X } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { getCurrentPlace, LocationError, searchPlaces, type LocationErrorReason, type PickedPlace } from "@/lib/current-location";

/**
 * Step 1 of adding an address — Blinkit's "Select delivery location", without
 * a map: search with live suggestions, "Use current location", or skip to
 * typing it in. Picking anything hands a place to the details step.
 */
export function LocationPicker({
  onPick,
  onManual,
  onCancel,
}: {
  onPick: (place: PickedPlace) => void;
  onManual: () => void;
  onCancel?: () => void;
}) {
  const [query, setQuery] = useState("");
  // Results remember which query they answer, so stale ones never show.
  const [answer, setAnswer] = useState<{ q: string; places: PickedPlace[] } | null>(null);
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<{ message: string; reason: LocationErrorReason } | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Debounced type-ahead; the newest query cancels the one before it.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((places) => setAnswer({ q, places }))
        .catch(() => {
          if (!controller.signal.aborted) setAnswer({ q, places: [] });
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmed = query.trim();
  const results = answer?.q === trimmed ? answer.places : null;
  const searching = trimmed.length >= 3 && results === null;

  const locate = async () => {
    setLocating(true);
    setError(null);
    try {
      const place = await getCurrentPlace();
      AccessibilityInfo.announceForAccessibility(`Location found: ${place.title}`);
      onPick(place);
    } catch (cause) {
      setError(
        cause instanceof LocationError
          ? { message: cause.message, reason: cause.reason }
          : { message: "Couldn't detect your location. Please try again.", reason: "unavailable" },
      );
    } finally {
      setLocating(false);
    }
  };

  const showingResults = trimmed.length >= 3;

  return (
    <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Display size={24}>Select delivery location</Display>
        {onCancel ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onCancel} hitSlop={12} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
            <X size={20} color={colors.charcoal} strokeWidth={1.6} />
          </Pressable>
        ) : null}
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            height: 48,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: focused ? colors.gold : colors.line,
            backgroundColor: colors.beige,
          }}
        >
          <Search size={18} color={focused ? colors.goldText : colors.muted} strokeWidth={1.8} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search for area, street name…"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search for area or street name"
            style={{ flex: 1, height: "100%", fontFamily: fonts.sans.regular, fontSize: 16, color: colors.ink }}
          />
          {searching ? (
            <ActivityIndicator size="small" color={colors.muted} />
          ) : query ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")} hitSlop={12}>
              <X size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </Pressable>
      </View>

      {showingResults ? (
        <View style={{ marginTop: 8, paddingBottom: 8 }}>
          {results === null ? null : results.length === 0 ? (
            <View style={{ paddingHorizontal: 20, paddingVertical: 24, gap: 12 }}>
              <Sans size={14} color={colors.muted}>
                No matches for “{query.trim()}”. Try a nearby area or landmark.
              </Sans>
              <Pressable onPress={onManual} hitSlop={8} style={{ alignSelf: "flex-start" }}>
                <Eyebrow size={10} color={colors.goldText} weight="medium">
                  Add address manually
                </Eyebrow>
              </Pressable>
            </View>
          ) : (
            results.map((place, i) => (
              <Pressable
                key={place.id}
                accessibilityRole="button"
                accessibilityLabel={`${place.title}, ${place.subtitle}`}
                onPress={() => onPick(place)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: pressed ? colors.beige : "transparent",
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.line,
                })}
              >
                <MapPin size={18} color={colors.muted} strokeWidth={1.6} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Sans size={15} weight="medium" numberOfLines={1}>
                    {place.title}
                  </Sans>
                  {place.subtitle ? (
                    <Sans size={12} color={colors.muted} leading="snug" numberOfLines={2}>
                      {place.subtitle}
                    </Sans>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <View style={{ marginTop: 16, paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
          {/* The hero action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use current location"
            accessibilityHint="Detects your address using GPS"
            accessibilityState={{ busy: locating, disabled: locating }}
            disabled={locating}
            onPress={() => void locate()}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              minHeight: 68,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: colors.gold,
              backgroundColor: pressed ? colors.beigeDark : colors.beige,
            })}
          >
            <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.charcoal }}>
              {locating ? <ActivityIndicator size="small" color={colors.gold} /> : <LocateFixed size={20} color={colors.gold} strokeWidth={1.8} />}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Sans size={15} weight="medium" color={colors.goldText}>
                {locating ? "Detecting your location…" : "Use current location"}
              </Sans>
              <Sans size={12} color={colors.muted}>
                {locating ? "This takes a few seconds" : "Using GPS"}
              </Sans>
            </View>
            {locating ? null : <ChevronRight size={18} color={colors.goldText} />}
          </Pressable>

          {error ? (
            <View accessibilityRole="alert" style={{ borderLeftWidth: 2, borderLeftColor: colors.error, backgroundColor: "rgba(192,57,43,0.05)", paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}>
              <Sans size={12} color={colors.error} leading="snug">
                {error.message}
              </Sans>
              {error.reason === "denied" && Platform.OS !== "web" ? (
                <Pressable accessibilityRole="link" onPress={() => void Linking.openSettings()} hitSlop={12} style={{ alignSelf: "flex-start" }}>
                  <Eyebrow size={10} color={colors.charcoal} weight="medium" style={{ textDecorationLine: "underline" }}>
                    Open Settings
                  </Eyebrow>
                </Pressable>
              ) : error.reason === "unavailable" ? (
                <Pressable accessibilityRole="button" onPress={() => void locate()} hitSlop={12} style={{ alignSelf: "flex-start" }}>
                  <Eyebrow size={10} color={colors.charcoal} weight="medium" style={{ textDecorationLine: "underline" }}>
                    Try again
                  </Eyebrow>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Secondary: type it in */}
          <Pressable
            accessibilityRole="button"
            onPress={onManual}
            disabled={locating}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              minHeight: 60,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: pressed ? colors.beige : colors.white,
              opacity: locating ? 0.5 : 1,
            })}
          >
            <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line }}>
              <Plus size={18} color={colors.charcoal} strokeWidth={1.6} />
            </View>
            <Sans size={15} style={{ flex: 1 }}>
              Add address manually
            </Sans>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
