import { useState } from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/lib/theme";
import { ApiError, errorMessage } from "@/lib/api/client";
import type { Address, AddressInput } from "@/lib/api/addresses";
import { Button } from "@/components/ui/button";
import { Checkbox, ErrorBox, Field } from "@/components/ui/field";
import { Eyebrow, Sans } from "@/components/ui/text";

const EMPTY_FORM: AddressInput = {
  label: "",
  type: "HOME",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const TYPES: { value: AddressInput["type"] & string; label: string }[] = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
  { value: "OTHER", label: "Other" },
];

/** Shared by the addresses screen and checkout — one form, one validation error map. */
export function AddressForm({
  initial,
  save,
  onSaved,
  onCancel,
}: {
  initial?: Address;
  save: (input: AddressInput) => Promise<Address>;
  onSaved: (address: Address) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(
    initial
      ? {
          label: initial.label ?? "",
          type: initial.type,
          fullName: initial.fullName,
          phone: initial.phone,
          alternatePhone: initial.alternatePhone ?? "",
          line1: initial.line1,
          line2: initial.line2 ?? "",
          landmark: initial.landmark ?? "",
          city: initial.city,
          state: initial.state,
          pincode: initial.pincode,
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const saved = await save({
        ...form,
        alternatePhone: form.alternatePhone || undefined,
        line2: form.line2 || undefined,
        landmark: form.landmark || undefined,
        label: form.label || undefined,
      });
      await onSaved(saved);
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const editable = !saving;

  return (
    <View style={{ borderWidth: 1, borderColor: colors.line, padding: 24, gap: 20 }}>
      {error ? <ErrorBox>{error}</ErrorBox> : null}

      <Field label="Label" value={form.label ?? ""} onChangeText={(v) => set("label", v)} placeholder="Home" editable={editable} />

      <View>
        <Eyebrow size={10}>Type</Eyebrow>
        <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
          {TYPES.map((t) => {
            const active = form.type === t.value;
            return (
              <Pressable
                key={t.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                disabled={saving}
                onPress={() => set("type", t.value)}
                style={{ borderWidth: 1, borderColor: active ? colors.charcoal : colors.line, backgroundColor: active ? colors.charcoal : "transparent", paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Sans size={14} color={active ? colors.white : colors.charcoal}>
                  {t.label}
                </Sans>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field label="Full name" value={form.fullName} onChangeText={(v) => set("fullName", v)} editable={editable} error={fieldErrors.fullName} autoComplete="name" />
      <Field label="Phone" value={form.phone} onChangeText={(v) => set("phone", v)} editable={editable} error={fieldErrors.phone} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Alternate phone" value={form.alternatePhone ?? ""} onChangeText={(v) => set("alternatePhone", v)} editable={editable} error={fieldErrors.alternatePhone} keyboardType="phone-pad" />
      <Field label="Address line 1" value={form.line1} onChangeText={(v) => set("line1", v)} editable={editable} error={fieldErrors.line1} autoComplete="street-address" />
      <Field label="Address line 2" value={form.line2 ?? ""} onChangeText={(v) => set("line2", v)} editable={editable} />
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Field label="City" value={form.city} onChangeText={(v) => set("city", v)} editable={editable} error={fieldErrors.city} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="State" value={form.state} onChangeText={(v) => set("state", v)} editable={editable} error={fieldErrors.state} />
        </View>
      </View>
      <Field label="Pincode" value={form.pincode} onChangeText={(v) => set("pincode", v)} editable={editable} error={fieldErrors.pincode} keyboardType="number-pad" autoComplete="postal-code" />

      <Checkbox checked={Boolean(form.isDefault)} onChange={(v) => set("isDefault", v)} disabled={saving}>
        <Sans size={12} color={colors.muted}>
          Set as default address
        </Sans>
      </Checkbox>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 20, paddingTop: 8 }}>
        <Button variant="gold" size="sm" onPress={() => void handleSubmit()} loading={saving} disabled={saving}>
          Save address
        </Button>
        <Pressable onPress={onCancel} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
          <Eyebrow size={10}>Cancel</Eyebrow>
        </Pressable>
      </View>
    </View>
  );
}
