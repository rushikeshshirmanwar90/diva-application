import { useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { BadgeCheck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import type { Product, Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";
import { useStoreActions } from "@/lib/store/store";
import { errorMessage } from "@/lib/api/client";
import { blockReviewAuthor, reportReview, type ReportReason } from "@/lib/api/reviews";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { ErrorBox } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { useNavigate } from "@/components/ui/link";
import { ReviewForm } from "@/components/product/review-form";

export function ReviewsSection({ product, reviews, onSubmitted }: { product: Product; reviews: Review[]; onSubmitted?: () => void }) {
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  }));
  const verifiedCount = reviews.filter((review) => review.verifiedPurchase).length;

  // Reviews this customer reported or whose author they blocked, hidden at
  // once while the list reloads (the backend filters them from then on).
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const visible = reviews.filter((review) => !hiddenIds.includes(review.id));
  const hide = (id: string) => {
    setHiddenIds((ids) => [...ids, id]);
    onSubmitted?.();
  };

  return (
    <View style={{ gap: 48 }}>
      <View>
        <Eyebrow>Reviews</Eyebrow>
        <Display size={60} leading="none" style={{ marginTop: 16 }}>
          {product.ratingAvg.toFixed(1)}
        </Display>
        <View style={{ marginTop: 12 }}>
          <Rating value={product.ratingAvg} />
        </View>
        <Sans size={12} color={colors.muted} style={{ marginTop: 8 }}>
          {product.ratingCount === 1 ? "1 review" : `${product.ratingCount} reviews`}
          {verifiedCount > 0 ? ` · ${verifiedCount} verified` : ""}
        </Sans>

        <View style={{ marginTop: 32, gap: 8 }}>
          {distribution.map((d) => (
            <View key={d.stars} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Sans size={12} color={colors.muted} style={{ width: 32 }}>
                {d.stars}★
              </Sans>
              <View style={{ flex: 1, height: 4, backgroundColor: colors.line }}>
                <View style={{ height: "100%", backgroundColor: colors.gold, width: `${(d.count / Math.max(1, product.ratingCount)) * 100}%` }} />
              </View>
              <Sans size={12} color={colors.muted} align="right" style={{ width: 40 }}>
                {d.count}
              </Sans>
            </View>
          ))}
        </View>

        <Sans size={12} leading="relaxed" color={colors.muted} style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 24 }}>
          Only customers who bought this piece can review it. We never delete a review for being critical — the two-star
          ones below are real.
        </Sans>
      </View>

      <View>
        <ReviewForm productId={product.id} productTitle={product.title} onSubmitted={onSubmitted} />

        {visible.length === 0 ? (
          <Sans size={14} color={colors.muted} style={{ marginTop: 32 }}>
            No written reviews on this piece yet — be the first to write one.
          </Sans>
        ) : (
          <View style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: colors.line }}>
            {visible.map((r, i) => (
              <View key={r.id} style={{ paddingVertical: 32, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                  <Rating value={r.rating} />
                  {r.verifiedPurchase ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <BadgeCheck size={12} color={colors.success} />
                      <Eyebrow size={10} color={colors.success}>
                        Verified purchase
                      </Eyebrow>
                    </View>
                  ) : null}
                </View>
                {r.title ? (
                  <Display size={20} style={{ marginTop: 12 }}>
                    {r.title}
                  </Display>
                ) : null}
                <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 8 }}>
                  {r.body}
                </Sans>
                {r.images && r.images.length > 0 ? (
                  <View style={{ marginTop: 16, flexDirection: "row", gap: 12 }}>
                    {r.images.map((image) => (
                      <View key={image} style={{ width: 80, height: 80, backgroundColor: colors.beige, overflow: "hidden" }}>
                        <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      </View>
                    ))}
                  </View>
                ) : null}
                {r.reply ? (
                  <View style={{ marginTop: 12, borderLeftWidth: 2, borderLeftColor: "rgba(201,162,39,0.4)", paddingLeft: 16 }}>
                    <Eyebrow size={10} color={colors.gold}>
                      Diva replied
                    </Eyebrow>
                    <Sans size={14} color={colors.muted} style={{ marginTop: 4 }}>
                      {r.reply.body}
                    </Sans>
                  </View>
                ) : null}
                <Sans size={11} color={colors.muted} tracking={0.025} style={{ marginTop: 16 }}>
                  {[r.author, r.city, formatDate(r.date)].filter(Boolean).join(" · ")}
                </Sans>
                {!r.isOwn ? <ReviewModeration review={r} onHidden={() => hide(r.id)} /> : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: "OFFENSIVE", label: "Offensive or abusive" },
  { id: "SPAM", label: "Spam or advertising" },
  { id: "IRRELEVANT", label: "Not about this product" },
  { id: "PERSONAL_INFO", label: "Shares personal information" },
  { id: "OTHER", label: "Something else" },
];

/**
 * "Report" and "Block" under each review (App Store guideline 1.2). Both need
 * an account; a guest is sent to sign in and brought back here.
 */
function ReviewModeration({ review, onHidden }: { review: Review; onHidden: () => void }) {
  const { status } = useAuth();
  const { notify } = useStoreActions();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"idle" | "report" | "block">("idle");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (next: "report" | "block") => {
    if (status !== "authenticated") {
      notify("Sign in to report or block a review.");
      navigate(`/login?redirect=${encodeURIComponent(`/product/${review.productSlug}`)}`);
      return;
    }
    setError(null);
    setReason(null);
    setMode(next);
  };

  const submitReport = async () => {
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reportReview(review.id, reason);
      notify("Thanks for reporting. We've hidden this review and will check it within 24 hours.");
      onHidden();
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  };

  const submitBlock = async () => {
    setBusy(true);
    setError(null);
    try {
      await blockReviewAuthor(review.id);
      notify(`You won't see reviews from ${review.author} again.`);
      onHidden();
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  };

  if (mode === "idle") {
    return (
      <View style={{ marginTop: 12, flexDirection: "row", gap: 20 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Report review by ${review.author}`} onPress={() => open("report")} hitSlop={8}>
          {({ pressed }) => (
            <Eyebrow size={10} color={pressed ? colors.charcoal : colors.muted}>
              Report
            </Eyebrow>
          )}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Block ${review.author}`} onPress={() => open("block")} hitSlop={8}>
          {({ pressed }) => (
            <Eyebrow size={10} color={pressed ? colors.charcoal : colors.muted}>
              Block user
            </Eyebrow>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 16, gap: 16, borderWidth: 1, borderColor: colors.line, padding: 16 }}>
      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {mode === "report" ? (
        <>
          <Sans size={14}>Why are you reporting this review?</Sans>
          <View style={{ gap: 4 }} accessibilityRole="radiogroup">
            {REPORT_REASONS.map((option) => {
              const selected = reason === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setReason(option.id)}
                  disabled={busy}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selected ? colors.gold : colors.muted,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold }} /> : null}
                  </View>
                  <Sans size={14}>{option.label}</Sans>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <Sans size={14} leading="relaxed">
          Block {review.author}? You won&apos;t see their reviews anywhere in the app.
        </Sans>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <Button
          variant="solid"
          size="sm"
          loading={busy}
          disabled={busy}
          onPress={() => void (mode === "report" ? submitReport() : submitBlock())}
        >
          {mode === "report" ? "Report review" : "Block user"}
        </Button>
        <Pressable onPress={() => setMode("idle")} disabled={busy} style={{ opacity: busy ? 0.5 : 1 }}>
          <Eyebrow size={10}>Cancel</Eyebrow>
        </Pressable>
      </View>
    </View>
  );
}
