import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { usePathname } from "expo-router";
import { Heart, MapPin, Package, Star, User } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useAuth } from "@/lib/auth/auth-context";
import { Page, Container } from "@/components/layout/page";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Display, Eyebrow } from "@/components/ui/text";
import { Link, useNavigate } from "@/components/ui/link";

const links = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
];

/**
 * `app/account/layout.tsx`: the greeting, sign-out, and the chip nav. A guest
 * is sent to `/login` — this section is real estate a stranger should never see.
 */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();

  useEffect(() => {
    if (status === "guest") navigate("/login", "replace");
  }, [status, navigate]);

  if (status !== "authenticated" || !user) {
    return (
      <Page>
        <View style={{ minHeight: 480 }} />
      </Page>
    );
  }

  const handleSignOut = async () => {
    await logout();
    navigate("/login", "replace");
  };

  return (
    <Page>
      <Container style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Breadcrumbs trail={[{ label: "My account" }]} />

        <View style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 32 }}>
          <View style={{ flexShrink: 1 }}>
            <Eyebrow>Signed in as {user.email}</Eyebrow>
            <Display size={36} style={{ marginTop: 8 }}>
              Namaste, {user.name.split(" ")[0]}
            </Display>
          </View>
          <Pressable onPress={() => void handleSignOut()}>
            {({ pressed }) => (
              <Eyebrow size={10} color={pressed ? colors.sale : colors.muted}>
                Sign out
              </Eyebrow>
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 40, gap: 24 }}>
          <AccountNav />
          <View>{children}</View>
        </View>
      </Container>
    </Page>
  );
}

function AccountNav() {
  const pathname = usePathname();
  return (
    <View accessibilityLabel="Account" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: active ? colors.gold : colors.line,
              backgroundColor: active ? colors.gold : "transparent",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Icon size={13} strokeWidth={1.5} color={active ? colors.white : colors.charcoal} />
            <Eyebrow color={active ? colors.white : colors.charcoal}>{label}</Eyebrow>
          </Link>
        );
      })}
    </View>
  );
}
