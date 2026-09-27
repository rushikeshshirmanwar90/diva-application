import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useAuth } from "@/lib/auth/auth-context";
import { listOrders, type Order } from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox, ErrorBox, Field } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

/** The account overview: real profile fields, an inline edit form, the two most recent orders. */
export function AccountProfileView() {
  const { user, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentOrders, setRecentOrders] = useState<Order[] | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { items, total } = await listOrders(1, 2);
        if (cancelled) return;
        setRecentOrders(items);
        setOrderCount(total);
      } catch {
        if (!cancelled) {
          setRecentOrders([]);
          setOrderCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  const startEditing = () => {
    setName(user.name);
    setPhone(user.phone ?? "");
    setMarketingOptIn(user.marketingOptIn);
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, marketingOptIn });
      setEditing(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const profile: [string, string][] = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Mobile", user.phone || "Not added"],
  ];

  return (
    <View style={{ gap: 56 }}>
      <View style={{ backgroundColor: colors.line, gap: 1 }}>
        <View style={{ backgroundColor: colors.white, paddingVertical: 28 }}>
          <Display size={30}>{orderCount ?? "—"}</Display>
          <Eyebrow size={10} style={{ marginTop: 4 }}>
            Orders placed
          </Eyebrow>
        </View>
        <View style={{ backgroundColor: colors.white, paddingVertical: 28 }}>
          <Display size={30}>{formatDate(user.createdAt)}</Display>
          <Eyebrow size={10} style={{ marginTop: 4 }}>
            Member since
          </Eyebrow>
        </View>
      </View>

      <View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 16 }}>
          <Display size={24}>Personal details</Display>
          {!editing ? (
            <Pressable onPress={startEditing}>
              <Eyebrow size={10} color={colors.gold}>
                Edit
              </Eyebrow>
            </Pressable>
          ) : null}
        </View>

        {editing ? (
          <View style={{ marginTop: 24, gap: 24 }}>
            {error ? <ErrorBox>{error}</ErrorBox> : null}
            <Field label="Full name" value={name} onChangeText={setName} editable={!saving} autoComplete="name" />
            <Field label="Mobile" value={phone} onChangeText={setPhone} editable={!saving} keyboardType="phone-pad" />
            <Checkbox checked={marketingOptIn} onChange={setMarketingOptIn} disabled={saving}>
              <Sans size={12} leading="relaxed" color={colors.muted}>
                Send me one letter a month about new pieces and where the gold rate has moved.
              </Sans>
            </Checkbox>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <Button variant="gold" loading={saving} disabled={saving} onPress={() => void handleSave()}>
                Save changes
              </Button>
              <Pressable onPress={() => setEditing(false)} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
                <Eyebrow size={10}>Cancel</Eyebrow>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 24, gap: 20 }}>
            {profile.map(([k, v]) => (
              <View key={k} style={{ borderBottomWidth: 1, borderBottomColor: "rgba(230,224,215,0.7)", paddingBottom: 12 }}>
                <Eyebrow size={10}>{k}</Eyebrow>
                <Sans size={14} style={{ marginTop: 4 }}>
                  {v}
                </Sans>
              </View>
            ))}
          </View>
        )}
      </View>

      <View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 16 }}>
          <Display size={24}>Recent orders</Display>
          <Link href="/account/orders" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Eyebrow size={10} color={colors.gold}>
              All orders
            </Eyebrow>
            <ArrowRight size={12} color={colors.gold} />
          </Link>
        </View>

        {recentOrders === null ? (
          <Sans size={14} color={colors.muted} style={{ marginTop: 24 }}>
            Loading…
          </Sans>
        ) : recentOrders.length === 0 ? (
          <Sans size={14} color={colors.muted} style={{ marginTop: 24 }}>
            No orders yet — your pieces will show up here once you check out.
          </Sans>
        ) : (
          <View style={{ marginTop: 24 }}>
            {recentOrders.map((order, i) => (
              <View key={order.orderNumber} style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 20, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
                <View>
                  <Link href={`/account/orders/${order.orderNumber}`}>
                    <Sans size={14}>{order.orderNumber}</Sans>
                  </Link>
                  <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                    {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                  </Sans>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Sans size={14}>{formatPaise(order.totals.grandTotalPaise)}</Sans>
                  <Eyebrow size={10} color={colors.gold} style={{ marginTop: 4 }}>
                    {order.status.replace(/_/g, " ")}
                  </Eyebrow>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
