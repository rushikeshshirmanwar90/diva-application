import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { deleteReview, listMyReviews, submitReview, type MyReview } from "@/lib/api/reviews";
import { errorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { Rating } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ErrorBox, Field } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { InlineLink, Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";

const statusLabel: Record<MyReview["status"], string> = {
  PENDING: "Awaiting moderation",
  APPROVED: "Published",
  REJECTED: "Not published",
};

const statusTone: Record<MyReview["status"], string> = {
  PENDING: colors.muted,
  APPROVED: colors.success,
  REJECTED: colors.sale,
};

export function ReviewsView() {
  const [reviews, setReviews] = useState<MyReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    try {
      const { items } = await listMyReviews();
      setReviews(items);
    } catch (cause) {
      setError(errorMessage(cause));
      setReviews([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await reload();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteReview(id);
      setReviews((current) => current?.filter((r) => r._id !== id) ?? null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setDeletingId(null);
      setConfirmingDeleteId(null);
    }
  };

  return (
    <View>
      <Display size={24}>Your reviews</Display>
      <Sans size={14} color={colors.muted} style={{ marginTop: 8 }}>
        Everything you have written about pieces you bought.
      </Sans>

      {error ? (
        <View style={{ marginTop: 24 }}>
          <ErrorBox>{error}</ErrorBox>
        </View>
      ) : null}

      {reviews === null ? (
        <View style={{ marginTop: 40, alignItems: "center", paddingVertical: 40 }}>
          <Spinner size={44} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ marginTop: 40 }}>
          <EmptyState
            icon={<Star size={24} strokeWidth={1.3} color={colors.gold} />}
            title="You haven't reviewed anything yet"
            body="Reviews you write on a product page will show up here, along with their moderation status."
          />
        </View>
      ) : (
        <View style={{ marginTop: 32, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
          {reviews.map((review, i) => (
            <View key={review._id} style={{ flexDirection: "row", gap: 20, paddingVertical: 24, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
              <Link href={`/product/${review.productId.slug}`} style={{ width: 80, height: 80, backgroundColor: colors.beige, overflow: "hidden" }}>
                {review.productId.images[0] ? (
                  <Image source={{ uri: review.productId.images[0].url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : null}
              </Link>
              <View style={{ flex: 1, minWidth: 0 }}>
                {editingId === review._id ? (
                  <EditReviewForm
                    review={review}
                    onCancel={() => setEditingId(null)}
                    onSaved={async () => {
                      setEditingId(null);
                      await reload();
                    }}
                  />
                ) : (
                  <>
                    <Rating value={review.rating} />
                    {review.title ? (
                      <Display size={18} style={{ marginTop: 8 }}>
                        {review.title}
                      </Display>
                    ) : null}
                    {review.body ? (
                      <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 4 }}>
                        {review.body}
                      </Sans>
                    ) : null}
                    <Sans size={11} color={colors.muted} style={{ marginTop: 12 }}>
                      On{" "}
                      <InlineLink href={`/product/${review.productId.slug}`}>
                        <Sans size={11} color={colors.charcoal}>
                          {review.productId.title}
                        </Sans>
                      </InlineLink>{" "}
                      · {formatDate(review.createdAt)} ·{" "}
                      <Sans size={11} color={statusTone[review.status]}>
                        {statusLabel[review.status]}
                      </Sans>
                    </Sans>
                    {review.status === "REJECTED" && review.rejectionReason ? (
                      <Sans size={11} color={colors.sale} style={{ marginTop: 4 }}>
                        {review.rejectionReason}
                      </Sans>
                    ) : null}
                    {review.reply ? (
                      <View style={{ marginTop: 12, borderLeftWidth: 2, borderLeftColor: "rgba(201,162,39,0.4)", paddingLeft: 16 }}>
                        <Eyebrow size={10} color={colors.gold}>
                          Diva replied
                        </Eyebrow>
                        <Sans size={14} color={colors.muted} style={{ marginTop: 4 }}>
                          {review.reply.body}
                        </Sans>
                      </View>
                    ) : null}

                    <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
                      <Pressable onPress={() => setEditingId(review._id)}>
                        <Eyebrow size={10} color={colors.charcoal}>
                          Edit
                        </Eyebrow>
                      </Pressable>
                      {confirmingDeleteId === review._id ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                          <Eyebrow size={10}>Remove this review?</Eyebrow>
                          <Pressable onPress={() => void handleDelete(review._id)} disabled={deletingId === review._id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            {deletingId === review._id ? <ActivityIndicator size="small" color={colors.sale} /> : null}
                            <Eyebrow size={10} color={colors.sale}>
                              Confirm
                            </Eyebrow>
                          </Pressable>
                          <Pressable onPress={() => setConfirmingDeleteId(null)} disabled={deletingId === review._id}>
                            <Eyebrow size={10}>Cancel</Eyebrow>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable onPress={() => setConfirmingDeleteId(review._id)}>
                          <Eyebrow size={10} color={colors.charcoal}>
                            Remove
                          </Eyebrow>
                        </Pressable>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EditReviewForm({ review, onCancel, onSaved }: { review: MyReview; onCancel: () => void; onSaved: () => void | Promise<void> }) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title ?? "");
  const [body, setBody] = useState(review.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await submitReview({ productId: review.productId._id, rating, title: title.trim() || undefined, body: body.trim() || undefined });
      await onSaved();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }} accessibilityLabel="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} accessibilityRole="radio" accessibilityState={{ selected: n === rating }} accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`} onPress={() => setRating(n)} disabled={saving}>
            <Star size={18} strokeWidth={1.5} color={n <= rating ? colors.gold : colors.line} fill={n <= rating ? colors.gold : "transparent"} />
          </Pressable>
        ))}
      </View>
      <Field value={title} onChangeText={setTitle} placeholder="Title (optional)" editable={!saving} />
      <Field boxed multiline value={body} onChangeText={setBody} placeholder="Your review" editable={!saving} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <Button variant="gold" size="sm" loading={saving} disabled={saving} onPress={() => void handleSubmit()}>
          Save changes
        </Button>
        <Pressable onPress={onCancel} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
          <Eyebrow size={10}>Cancel</Eyebrow>
        </Pressable>
      </View>
    </View>
  );
}
