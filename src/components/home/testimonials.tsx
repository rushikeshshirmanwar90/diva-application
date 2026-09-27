import { useEffect, useState } from "react";
import { View } from "react-native";
import { Quote } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { fetchFeaturedReviews, type FeaturedReviews } from "@/lib/api/catalogue";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Rating } from "@/components/ui/rating";
import { Container } from "@/components/layout/page";

/**
 * Reviews staff starred in the admin, same as the site's section. Nothing
 * renders until they arrive, and nothing renders at all if none are starred
 * or the request fails — no section beats a section of invented quotes.
 */
export function Testimonials() {
  const [featured, setFeatured] = useState<FeaturedReviews | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchFeaturedReviews().then((result) => {
      if (!cancelled && result) setFeatured(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const testimonials = featured?.testimonials ?? [];
  const summary = featured?.summary;

  if (testimonials.length === 0) return null;

  const eyebrow = summary
    ? `${summary.ratingCount.toLocaleString("en-IN")} ${summary.ratingCount === 1 ? "review" : "reviews"} · ${summary.ratingAvg.toFixed(1)} average`
    : "What our customers say";

  return (
    <View style={{ backgroundColor: colors.charcoal }}>
      <Container style={{ paddingVertical: 96 }}>
        <View style={{ alignItems: "center" }}>
          <Sans size={10} color={colors.goldLight} uppercase tracking={0.32} align="center">
            {eyebrow}
          </Sans>
          <Display size={30} leading="tight" color={colors.white} align="center" style={{ marginTop: 16 }}>
            What customers actually say
          </Display>
        </View>

        <View style={{ marginTop: 56, backgroundColor: "rgba(255,255,255,0.1)", gap: 1 }}>
          {testimonials.map((t) => (
            <View key={t.id} style={{ backgroundColor: colors.charcoal, padding: 32, gap: 20 }}>
              <Quote size={20} strokeWidth={1.3} color={colors.gold} />
              <Sans size={14} leading="relaxed" color="rgba(255,255,255,0.8)">
                {t.quote}
              </Sans>
              <View>
                <Rating value={t.rating} textColor="rgba(255,255,255,0.5)" />
                <Eyebrow color={colors.white} style={{ marginTop: 12 }}>
                  {t.name}
                </Eyebrow>
                {t.city ? (
                  <Sans size={10} color="rgba(255,255,255,0.45)" tracking={0.025}>
                    {t.city}
                  </Sans>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </Container>
    </View>
  );
}
