import { View } from "react-native";
import { Image } from "expo-image";
import { BadgeCheck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import type { Product, Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Rating } from "@/components/ui/rating";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { ReviewForm } from "@/components/product/review-form";

export function ReviewsSection({ product, reviews, onSubmitted }: { product: Product; reviews: Review[]; onSubmitted?: () => void }) {
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  }));
  const verifiedCount = reviews.filter((review) => review.verifiedPurchase).length;

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

        {reviews.length === 0 ? (
          <Sans size={14} color={colors.muted} style={{ marginTop: 32 }}>
            No written reviews on this piece yet — be the first to write one.
          </Sans>
        ) : (
          <View style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: colors.line }}>
            {reviews.map((r, i) => (
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
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
