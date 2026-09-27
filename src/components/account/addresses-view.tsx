import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { createAddress, deleteAddress, listAddresses, updateAddress, type Address } from "@/lib/api/addresses";
import { errorMessage } from "@/lib/api/client";
import { AddressForm } from "@/components/account/address-form";
import { ErrorBox } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";

export function AddressesView() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const reload = async () => {
    try {
      setAddresses(await listAddresses());
    } catch (cause) {
      setError(errorMessage(cause));
      setAddresses([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await reload();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteAddress(id);
      setAddresses((current) => current?.filter((a) => a._id !== id) ?? null);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      await updateAddress(id, { isDefault: true });
      await reload();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <View>
      <Display size={24}>Saved addresses</Display>
      <Sans size={14} color={colors.muted} style={{ marginTop: 8 }}>
        Delivery requires a photo ID matching the name on the address.
      </Sans>

      {error ? (
        <View style={{ marginTop: 24 }}>
          <ErrorBox>{error}</ErrorBox>
        </View>
      ) : null}

      {addresses === null ? (
        <View style={{ marginTop: 40, alignItems: "center", paddingVertical: 40 }}>
          <Spinner size={44} />
        </View>
      ) : (
        <View style={{ marginTop: 40, gap: 24 }}>
          {addresses.map((address) =>
            editingId === address._id ? (
              <AddressForm
                key={address._id}
                initial={address}
                onCancel={() => setEditingId(null)}
                onSaved={async () => {
                  setEditingId(null);
                  await reload();
                }}
                save={(input) => updateAddress(address._id, input)}
              />
            ) : (
              <View key={address._id} style={{ borderWidth: 1, borderColor: colors.line, padding: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Eyebrow size={10} color={colors.gold}>
                    {address.label || address.type}
                  </Eyebrow>
                  {address.isDefault ? (
                    <View style={{ backgroundColor: colors.beige, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Eyebrow size={9}>Default</Eyebrow>
                    </View>
                  ) : null}
                </View>
                <Sans size={14} style={{ marginTop: 16 }}>
                  {address.fullName}
                </Sans>
                <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 6 }}>
                  {address.line1}
                  {address.line2 ? `\n${address.line2}` : ""}
                  {"\n"}
                  {address.city}, {address.state} {address.pincode}
                  {"\n"}
                  {address.phone}
                </Sans>
                <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 20, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16 }}>
                  <Pressable onPress={() => setEditingId(address._id)}>
                    {({ pressed }) => (
                      <Eyebrow size={10} color={pressed ? colors.gold : colors.charcoal}>
                        Edit
                      </Eyebrow>
                    )}
                  </Pressable>
                  {!address.isDefault ? (
                    <Pressable onPress={() => void handleSetDefault(address._id)}>
                      {({ pressed }) => (
                        <Eyebrow size={10} color={pressed ? colors.gold : colors.charcoal}>
                          Set as default
                        </Eyebrow>
                      )}
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => void handleDelete(address._id)}>
                    {({ pressed }) => (
                      <Eyebrow size={10} color={pressed ? colors.sale : colors.charcoal}>
                        Remove
                      </Eyebrow>
                    )}
                  </Pressable>
                </View>
              </View>
            ),
          )}

          {editingId === "new" ? (
            <AddressForm
              onCancel={() => setEditingId(null)}
              onSaved={async () => {
                setEditingId(null);
                await reload();
              }}
              save={(input) => createAddress(input)}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditingId("new")}
              style={({ pressed }) => ({
                minHeight: 208,
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: pressed ? colors.gold : colors.line,
              })}
            >
              {({ pressed }) => (
                <>
                  <Plus size={20} strokeWidth={1.4} color={pressed ? colors.gold : colors.muted} />
                  <Eyebrow size={10} color={pressed ? colors.gold : colors.muted}>
                    Add a new address
                  </Eyebrow>
                </>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
