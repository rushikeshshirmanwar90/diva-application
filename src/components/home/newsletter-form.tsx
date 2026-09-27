import { useState } from "react";
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

/** Demo only — nothing is submitted anywhere. Same as the site. */
export function NewsletterForm({
  placeholder = "Your email address",
  dark = false,
  style,
}: {
  placeholder?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Sans size={14} color={dark ? colors.goldLight : colors.success} style={style}>
        Thank you — look for our first note on the 1st of the month.
      </Sans>
    );
  }

  const submit = () => {
    if (email.includes("@")) setDone(true);
  };

  return (
    <View
      style={[
        {
          maxWidth: 384,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: dark ? "rgba(255,255,255,0.3)" : "rgba(26,26,26,0.25)",
          paddingBottom: 8,
        },
        style,
      ]}
    >
      <TextInput
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={submit}
        placeholder={placeholder}
        placeholderTextColor={dark ? "rgba(255,255,255,0.5)" : colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Email address"
        style={{ flex: 1, fontFamily: fonts.sans.regular, fontSize: 16, color: dark ? colors.white : colors.ink, paddingVertical: 4 }}
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Subscribe" onPress={submit} hitSlop={8}>
        {({ pressed }) => (
          <ArrowRight size={17} color={pressed ? (dark ? colors.goldLight : colors.gold) : dark ? colors.white : colors.charcoal} />
        )}
      </Pressable>
    </View>
  );
}
