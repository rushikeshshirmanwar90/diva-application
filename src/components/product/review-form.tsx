import { useState } from "react";
import { Pressable, View } from "react-native";
import { Check, Star } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { apiFetch, errorMessage, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Field } from "@/components/ui/field";
import { InlineLink } from "@/components/ui/link";

/** "Write a review" — closed by default, a sign-in prompt for guests. */
export function ReviewForm({ productId, productTitle, onSubmitted }: { productId: string; productTitle: string; onSubmitted?: () => void }) {
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    setNeedsSignIn(false);
    if (rating === 0) {
      setError("Choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: { productId, rating, title: title.trim() || undefined, body: body.trim() || undefined },
      });
      setDone(true);
      onSubmitted?.();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) setNeedsSignIn(true);
      else setError(errorMessage(caught));
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={{ marginTop: 32, borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(248,245,240,0.4)", padding: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Check size={16} color={colors.gold} />
          <Sans size={14}>Thank you — your review has been submitted.</Sans>
        </View>
        <Sans size={12} color={colors.muted} style={{ marginTop: 8 }}>
          It’s live now — pull to refresh if you don’t see it below yet.
        </Sans>
      </View>
    );
  }

  if (!open) {
    if (status === "loading") return null;

    if (status !== "authenticated") {
      return (
        <View style={{ marginTop: 32, borderLeftWidth: 2, borderLeftColor: colors.gold, backgroundColor: "rgba(248,245,240,0.4)", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Sans size={14}>
            <InlineLink href="/login">
              <Sans size={14} color={colors.goldText}>
                Sign in
              </Sans>
            </InlineLink>{" "}
            to write a review — it keeps reviews tied to real customers.
          </Sans>
        </View>
      );
    }

    return (
      <View style={{ marginTop: 32 }}>
        <Button variant="outline" onPress={() => setOpen(true)}>
          Write a review
        </Button>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 32, borderWidth: 1, borderColor: colors.line, padding: 24 }}>
      <Display size={20}>Review {productTitle}</Display>

      <View style={{ marginTop: 20 }}>
        <Eyebrow>Your rating</Eyebrow>
        <View style={{ marginTop: 8, flexDirection: "row", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}
              accessibilityState={{ selected: rating === value }}
              onPress={() => setRating(value)}
              style={{ padding: 2 }}
            >
              <Star size={26} color={rating >= value ? colors.gold : colors.line} fill={rating >= value ? colors.gold : "transparent"} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Field label="Title" boxed value={title} onChangeText={setTitle} maxLength={120} placeholder="Sums up your experience" />
      </View>
      <View style={{ marginTop: 16 }}>
        <Field
          label="Your review"
          boxed
          multiline
          value={body}
          onChangeText={setBody}
          maxLength={4000}
          placeholder="How does it look and feel? Would you buy it again?"
        />
      </View>

      {needsSignIn ? (
        <View style={{ marginTop: 16, borderLeftWidth: 2, borderLeftColor: colors.gold, backgroundColor: "rgba(248,245,240,0.4)", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Sans size={14}>
            Please{" "}
            <InlineLink href="/login">
              <Sans size={14} color={colors.goldText}>
                sign in
              </Sans>
            </InlineLink>{" "}
            to post a review — it keeps reviews tied to real customers.
          </Sans>
        </View>
      ) : null}

      {error ? (
        <Sans size={14} color={colors.error} style={{ marginTop: 16 }} accessibilityRole="alert">
          {error}
        </Sans>
      ) : null}

      <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Button onPress={() => void submit()} loading={submitting} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
        <Pressable onPress={() => setOpen(false)}>
          <Eyebrow>Cancel</Eyebrow>
        </Pressable>
      </View>

      <Sans size={12} color={colors.muted} style={{ marginTop: 16 }}>
        Your review is published immediately and appears under your name.
      </Sans>
    </View>
  );
}
