import { forwardRef, useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Check, Eye, EyeOff } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { Eyebrow, Sans } from "@/components/ui/text";

/**
 * The site's underlined form field (`border-b`, gold on focus) and its boxed
 * variant (`border`, used by the review form and gift note).
 *
 * Forwards its ref to the underlying `TextInput` so a form can chain focus
 * with `returnKeyType="next"` + `onSubmitEditing={() => nextRef.current?.focus()}`
 * — the keyboard's own "next" button should move through a form the way a tab
 * key does, not dead-end after every field.
 *
 * A field passed `secureTextEntry` gets a reveal toggle for free: the single
 * biggest cause of a rejected password is a typo nobody could see, and asking
 * for the password twice only moves that risk into a second field.
 */
export const Field = forwardRef<TextInput, TextInputProps & {
  label?: string;
  hint?: React.ReactNode;
  error?: string;
  boxed?: boolean;
}>(function Field({ label, hint, error, boxed = false, multiline, secureTextEntry, style, ...input }, ref) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.gold : colors.line;
  const canReveal = Boolean(secureTextEntry);

  return (
    <View>
      {label || hint ? (
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          {label ? <Eyebrow size={10}>{label}</Eyebrow> : <View />}
          {hint}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          ref={ref}
          placeholderTextColor={alphaMuted}
          {...input}
          secureTextEntry={canReveal ? !revealed : secureTextEntry}
          multiline={multiline}
          accessibilityState={{ ...input.accessibilityState, disabled: input.editable === false }}
          // Tells VoiceOver/TalkBack to announce this field alongside its error.
          aria-invalid={Boolean(error)}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontFamily: fonts.sans.regular,
              fontSize: 16,
              color: colors.ink,
              marginTop: label ? 8 : 0,
              opacity: input.editable === false ? 0.5 : 1,
            },
            boxed
              ? {
                  borderWidth: 1,
                  borderColor,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  minHeight: multiline ? 112 : undefined,
                  textAlignVertical: multiline ? "top" : "center",
                }
              : { borderBottomWidth: 1, borderBottomColor: borderColor, paddingBottom: 10, paddingTop: 2 },
            canReveal && { paddingRight: 32 },
            style,
          ]}
        />
        {canReveal ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            hitSlop={10}
            onPress={() => setRevealed((v) => !v)}
            style={{ position: "absolute", right: 0, top: label ? 8 : 0, bottom: 10, justifyContent: "center" }}
          >
            {revealed ? (
              <EyeOff size={17} strokeWidth={1.6} color={colors.muted} />
            ) : (
              <Eye size={17} strokeWidth={1.6} color={colors.muted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Sans size={11} color={colors.error} style={{ marginTop: 6 }}>
          {error}
        </Sans>
      ) : null}
    </View>
  );
});

const alphaMuted = "rgba(122,115,108,0.7)";

/** `<input type="checkbox" class="accent-[#c9a227]">` */
export function Checkbox({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={{
          marginTop: 2,
          width: 16,
          height: 16,
          borderWidth: 1,
          borderColor: checked ? colors.gold : colors.muted,
          backgroundColor: checked ? colors.gold : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? <Check size={11} strokeWidth={3} color={colors.white} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

/** The `border border-[#c0392b]/30 bg-[#c0392b]/5` alert box. */
export function ErrorBox({ children }: { children: string }) {
  return (
    <View
      accessibilityRole="alert"
      style={{ borderWidth: 1, borderColor: "rgba(192,57,43,0.3)", backgroundColor: "rgba(192,57,43,0.05)", padding: 12 }}
    >
      <Sans size={12} color={colors.error}>
        {children}
      </Sans>
    </View>
  );
}
