import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

/** The header's round icon button: 36dp, beige when pressed. */
export function IconButton({
  onPress,
  label,
  children,
  size = 36,
  style,
  badge,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
  badge?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? colors.beigeDark : "transparent",
        },
        style,
      ]}
    >
      {children}
      {badge !== undefined && badge > 0 ? <Count value={badge} /> : null}
    </Pressable>
  );
}

export function Count({ value }: { value: number }) {
  return (
    <View
      style={{
        position: "absolute",
        top: -2,
        right: -2,
        height: 16,
        minWidth: 16,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: colors.gold,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Sans size={9} weight="medium" color={colors.white} leading={10}>
        {value > 99 ? "99+" : value}
      </Sans>
    </View>
  );
}
