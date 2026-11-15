import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { Display, Eyebrow, Sans } from "@/components/ui/text";

/**
 * A dropdown that looks like `Field` (eyebrow label, underline) and opens a
 * searchable bottom sheet. `search` filters the options; `allowCustom` adds a
 * "Use “…”" row so a value missing from the list never blocks the form.
 */
export function SelectField({
  label,
  value,
  placeholder = "Select",
  sheetTitle,
  search,
  onSelect,
  disabled,
  disabledHint,
  error,
  hint,
  allowCustom,
  searchPlaceholder = "Search",
}: {
  label: string;
  value: string;
  placeholder?: string;
  sheetTitle: string;
  search: (query: string) => readonly string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  /** Shown instead of the placeholder while disabled, e.g. "Select a state first". */
  disabledHint?: string;
  error?: string;
  hint?: React.ReactNode;
  allowCustom?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();

  const options = useMemo(() => (open ? search(query) : []), [open, query, search]);
  const typed = query.trim();
  const exact = options.some((o) => o.toLowerCase() === typed.toLowerCase());
  const showCustom = allowCustom && typed.length >= 2 && !exact;

  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const choose = (next: string) => {
    onSelect(next);
    close();
  };

  return (
    <View>
      <Eyebrow size={10}>{label}</Eyebrow>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label.replace(/\s*\*$/, "")}: ${value || "not selected"}`}
        accessibilityHint={disabled ? disabledHint : "Opens a list to choose from"}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          marginTop: 8,
          minHeight: 36,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingBottom: 10,
          paddingTop: 2,
          borderBottomWidth: 1,
          borderBottomColor: error ? colors.error : colors.line,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Sans size={16} color={value ? colors.ink : colors.muted} numberOfLines={1} style={{ flex: 1 }}>
          {value || (disabled && disabledHint ? disabledHint : placeholder)}
        </Sans>
        <ChevronDown size={16} color={colors.muted} strokeWidth={1.6} />
      </Pressable>
      {error ? (
        <Sans size={11} color={colors.error} style={{ marginTop: 6 }}>
          {error}
        </Sans>
      ) : hint ? (
        <View style={{ marginTop: 6 }}>{hint}</View>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <Pressable accessibilityLabel="Close" onPress={close} style={{ flex: 1, backgroundColor: "rgba(26,26,26,0.5)" }} />
          <View style={{ height: "78%", backgroundColor: colors.white, paddingBottom: insets.bottom }}>
            <View style={{ alignItems: "center", paddingTop: 8 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
              <Display size={22}>{sheetTitle}</Display>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={12} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
                <X size={20} color={colors.charcoal} strokeWidth={1.6} />
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 46, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.beige }}>
                <Search size={17} color={colors.muted} strokeWidth={1.8} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.muted}
                  autoFocus
                  autoCorrect={false}
                  accessibilityLabel={searchPlaceholder}
                  style={{ flex: 1, height: "100%", fontFamily: fonts.sans.regular, fontSize: 16, color: colors.ink }}
                />
                {query ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")} hitSlop={12}>
                    <X size={16} color={colors.muted} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              ListFooterComponent={
                showCustom ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => choose(typed)}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: pressed ? colors.beige : "transparent", borderTopWidth: 1, borderTopColor: colors.line })}
                  >
                    <Plus size={16} color={colors.goldText} />
                    <Sans size={15} color={colors.goldText}>
                      Use “{typed}”
                    </Sans>
                  </Pressable>
                ) : null
              }
              ListEmptyComponent={
                showCustom ? null : (
                  <Sans size={14} color={colors.muted} style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
                    No matches for “{typed}”.
                  </Sans>
                )
              }
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => choose(item)}
                    style={({ pressed }) => ({
                      minHeight: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      backgroundColor: pressed || selected ? colors.beige : "transparent",
                    })}
                  >
                    <Sans size={15} weight={selected ? "medium" : "regular"} style={{ flex: 1 }}>
                      {item}
                    </Sans>
                    {selected ? <Check size={16} color={colors.goldText} strokeWidth={2} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
