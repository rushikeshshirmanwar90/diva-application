import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Briefcase, CircleCheck, Home, MapPin, X } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { ApiError, errorMessage } from "@/lib/api/client";
import type { Address, AddressInput } from "@/lib/api/addresses";
import type { PickedPlace } from "@/lib/current-location";
import { Button } from "@/components/ui/button";
import { Checkbox, ErrorBox, Field } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { LocationPicker } from "@/components/account/location-picker";
import { SelectField } from "@/components/ui/select-field";
import { INDIA_STATES, citiesOf, matchCity, matchState, searchCities } from "@/lib/address-regions";
import { usePincode } from "@/lib/use-pincode";
import { useAuth } from "@/lib/auth/auth-context";

const searchStates = (query: string) => {
  const q = query.trim().toLowerCase();
  return q ? INDIA_STATES.filter((s) => s.toLowerCase().includes(q)) : INDIA_STATES;
};

const EMPTY_FORM: AddressInput = {
  label: "",
  type: "HOME",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const TYPES = [
  { value: "HOME", label: "Home", Icon: Home },
  { value: "WORK", label: "Work", Icon: Briefcase },
  { value: "OTHER", label: "Other", Icon: MapPin },
] as const;

/** The summary card's text for an address that already exists. */
function summaryOf(a: Pick<AddressInput, "line2" | "city" | "state" | "pincode">) {
  const [first, ...rest] = (a.line2 ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    title: first || a.city || "Delivery location",
    subtitle: [...rest, first ? a.city : null, a.state].filter(Boolean).join(", ") + (a.pincode ? ` ${a.pincode}` : ""),
  };
}

/**
 * Shared by the addresses screen and checkout. A new address starts at
 * "Select delivery location" (search or GPS, Blinkit-style); an existing one
 * opens straight on "Enter complete address" with a Change link back.
 */
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
  // A new address is usually for the account holder — start from their profile.
  const { user } = useAuth();
  const [prefilled, setPrefilled] = useState(false);
  if (!initial && user && !prefilled) {
    setPrefilled(true);
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      phone: current.phone || user.phone || "",
    }));
  }
  const [step, setStep] = useState<"locate" | "details">(initial ? "details" : "locate");
  const [place, setPlace] = useState<{ title: string; subtitle: string } | null>(initial ? summaryOf(initial) : null);
  const [focusFlat, setFocusFlat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // The pincode is the source of truth for the state. City is only filled
  // when it's empty or the state changed, so a picked suburb or town stays.
  const pincodeStatus = usePincode(form.pincode, (info) =>
    setForm((current) =>
      info.state !== current.state
        ? { ...current, state: info.state, city: info.city }
        : current.city
          ? current
          : { ...current, city: info.city },
    ),
  );

  const chooseState = (state: string) =>
    setForm((current) => ({
      ...current,
      state,
      city: citiesOf(state).includes(current.city) ? current.city : "",
    }));

  const pick = (picked: PickedPlace) => {
    setForm((current) => {
      const state = matchState(picked.fields.state) || current.state;
      return {
        ...current,
        line2: picked.fields.line2 || current.line2,
        state,
        city: matchCity(state, picked.fields.city) || current.city,
        pincode: picked.fields.pincode || current.pincode,
      };
    });
    setPlace({ title: picked.title, subtitle: picked.subtitle });
    setFocusFlat(true);
    setStep("details");
  };

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
        // "Home" and "Work" are their own label; only "Other" gets a custom name.
        label: form.type === "OTHER" ? form.label || undefined : undefined,
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

  if (step === "locate") {
    return (
      <LocationPicker
        onPick={pick}
        onManual={() => {
          setPlace(null);
          setStep("details");
        }}
        onCancel={initial ? () => setStep("details") : onCancel}
      />
    );
  }

  const editable = !saving;

  return (
    <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Display size={24}>{initial ? "Edit address" : "Enter complete address"}</Display>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onCancel} disabled={saving} hitSlop={12} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <X size={20} color={colors.charcoal} strokeWidth={1.6} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 22 }}>
        {/* Where it's going — with a way back to change it */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: colors.beige, borderWidth: 1, borderColor: colors.line }}>
          <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.charcoal }}>
            <MapPin size={17} color={colors.gold} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            {place ? (
              <>
                <Sans size={15} weight="medium" numberOfLines={1}>
                  {place.title}
                </Sans>
                {place.subtitle ? (
                  <Sans size={12} color={colors.muted} leading="snug" numberOfLines={2}>
                    {place.subtitle}
                  </Sans>
                ) : null}
              </>
            ) : (
              <>
                <Sans size={15} weight="medium">Location not set</Sans>
                <Sans size={12} color={colors.muted}>
                  Search or use GPS to fill this in faster
                </Sans>
              </>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={place ? "Change location" : "Select location"}
            onPress={() => setStep("locate")}
            disabled={saving}
            hitSlop={8}
            style={({ pressed }) => ({ borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: pressed ? colors.gold : "transparent" })}
          >
            <Eyebrow size={10} color={colors.charcoal} weight="medium">
              {place ? "Change" : "Select"}
            </Eyebrow>
          </Pressable>
        </View>

        {error ? <ErrorBox>{error}</ErrorBox> : null}

        <Field
          label="Area / Sector / Locality"
          value={form.line2 ?? ""}
          onChangeText={(v) => set("line2", v)}
          editable={editable}
          error={fieldErrors.line2}
          autoComplete="address-line2"
        />
        <Field
          // After a location is picked, the one thing left to type is the flat number.
          autoFocus={focusFlat}
          label="Flat / House no. / Building *"
          value={form.line1}
          onChangeText={(v) => set("line1", v)}
          placeholder="e.g. Flat 402, Lotus Residency"
          editable={editable}
          error={fieldErrors.line1}
          autoComplete="address-line1"
        />
        <Field
          label="Nearby landmark (optional)"
          value={form.landmark ?? ""}
          onChangeText={(v) => set("landmark", v)}
          placeholder="e.g. Opposite City Mall"
          editable={editable}
          error={fieldErrors.landmark}
        />
        <Field
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit pincode"
          editable={editable}
          error={fieldErrors.pincode ?? (pincodeStatus.kind === "not-found" ? "We couldn't find this pincode. Please check it." : undefined)}
          keyboardType="number-pad"
          autoComplete="postal-code"
          maxLength={6}
        />
        {pincodeStatus.kind === "checking" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: -12 }}>
            <ActivityIndicator size="small" color={colors.muted} />
            <Sans size={11} color={colors.muted}>
              Checking pincode…
            </Sans>
          </View>
        ) : pincodeStatus.kind === "found" ? (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: -12 }}>
            <CircleCheck size={13} color={colors.success} strokeWidth={2} />
            <Sans size={11} color={colors.success}>
              {pincodeStatus.info.city}, {pincodeStatus.info.state}
            </Sans>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <SelectField
              label="State *"
              value={form.state}
              placeholder="Select state"
              sheetTitle="Select state"
              searchPlaceholder="Search state"
              search={searchStates}
              onSelect={chooseState}
              disabled={saving}
              error={fieldErrors.state}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SelectField
              label="City *"
              value={form.city}
              placeholder="Select city"
              sheetTitle={form.state ? `Cities in ${form.state}` : "Select city"}
              searchPlaceholder="Search city or town"
              search={(q) => searchCities(form.state, q)}
              onSelect={(city) => set("city", city)}
              disabled={saving || !form.state}
              disabledHint="Pick state first"
              error={fieldErrors.city}
              allowCustom
            />
          </View>
        </View>

        {/* Receiver */}
        <View style={{ gap: 22, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Eyebrow size={10} color={colors.charcoal} weight="medium" style={{ marginTop: 16 }}>
            Receiver details
          </Eyebrow>
          {!initial && user ? (
            <Sans size={12} color={colors.muted} style={{ marginTop: -14 }}>
              Filled from your account. Change it if someone else will receive the order.
            </Sans>
          ) : null}
          <Field label="Full name *" value={form.fullName} onChangeText={(v) => set("fullName", v)} editable={editable} error={fieldErrors.fullName} autoComplete="name" />
          <Field label="Phone *" value={form.phone} onChangeText={(v) => set("phone", v)} editable={editable} error={fieldErrors.phone} keyboardType="phone-pad" autoComplete="tel" />
          <Field label="Alternate phone (optional)" value={form.alternatePhone ?? ""} onChangeText={(v) => set("alternatePhone", v)} editable={editable} error={fieldErrors.alternatePhone} keyboardType="phone-pad" />
        </View>

        {/* Save as */}
        <View style={{ gap: 10 }}>
          <Eyebrow size={10} color={colors.charcoal} weight="medium">
            Save address as
          </Eyebrow>
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
            {TYPES.map(({ value, label, Icon }) => {
              const active = form.type === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  disabled={saving}
                  onPress={() => set("type", value)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    minHeight: 44,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: active ? colors.charcoal : colors.line,
                    backgroundColor: active ? colors.charcoal : "transparent",
                  }}
                >
                  <Icon size={15} color={active ? colors.gold : colors.muted} strokeWidth={1.7} />
                  <Sans size={14} color={active ? colors.white : colors.charcoal}>
                    {label}
                  </Sans>
                </Pressable>
              );
            })}
          </View>
          {form.type === "OTHER" ? (
            <Field label="Name this address" value={form.label ?? ""} onChangeText={(v) => set("label", v)} placeholder="e.g. Mom's place" editable={editable} />
          ) : null}
        </View>

        <Checkbox checked={Boolean(form.isDefault)} onChange={(v) => set("isDefault", v)} disabled={saving}>
          <Sans size={12} color={colors.muted}>
            Set as default address
          </Sans>
        </Checkbox>

        <Button variant="gold" size="lg" fullWidth onPress={() => void handleSubmit()} loading={saving} disabled={saving}>
          Save address
        </Button>
      </View>
    </View>
  );
}
