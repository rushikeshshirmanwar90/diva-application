import type { Product } from "@/lib/types";

/**
 * "You may also like" — the ranking.
 *
 * A hybrid item-to-item recommender, which is what every serious storefront
 * runs under that heading. Each candidate gets one score from three sources:
 *
 *   1. **Behaviour** — orders that contained both products (co-purchase) and
 *      visitors who opened both pages (co-view). This is the collaborative-
 *      filtering half: it learns pairings a merchandiser would never write
 *      down, such as a particular bangle that sells with a particular set of
 *      earrings. Counts come from the backend's `/products/:slug/signals`.
 *
 *   2. **Content** — how alike the two products are on the facts the
 *      catalogue holds: category, collections, finish, gender, occasion, and
 *      price band. This is what carries a new product, or a new store, before
 *      any behaviour exists (the cold-start problem), and it stops the
 *      behavioural half recommending a ₹49,000 set beside a ₹900 charm just
 *      because someone once bought both.
 *
 *   3. **Quality prior** — a small nudge for well-reviewed pieces and
 *      bestsellers. Ties between equally similar candidates go to the better
 *      product, and a piece with no reviews is neither punished nor rewarded.
 *
 * Behaviour is weighted well above content when it exists, because a pair
 * that customers actually buy together beats any amount of attribute overlap.
 * But it is normalised against *this* product's own volume, so a single
 * co-purchase on a product that has sold three times counts for a lot, and
 * the same single co-purchase on one that has sold three hundred times counts
 * for almost nothing — which is the difference between a signal and noise.
 *
 * Finally a diversity pass: a rail of eight near-identical rings is not a
 * recommendation, it is the category page. The top of the list is re-picked so
 * the source's own category fills at most `DIVERSITY_SHARE` of the slots while
 * other categories can still make the cut, and no two picks share the same
 * finish *and* category unless nothing else is left.
 *
 * Everything here is pure — a list in, a list out — so it runs identically on
 * the server (the product page) and in tests, with no database in sight.
 */

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export type Signals = {
  coPurchased: { slug: string; count: number }[];
  coViewed: { slug: string; count: number }[];
  volume: { orders: number; visitors: number };
};

export type Weights = {
  coPurchase: number;
  coView: number;
  sameCategory: number;
  sharedCollection: number;
  sameFinish: number;
  sameGender: number;
  occasionOverlap: number;
  priceProximity: number;
  rating: number;
  bestseller: number;
  newArrival: number;
};

/**
 * The default weights. Chosen so that a perfect content match tops out
 * around 10 and a strong behavioural match around 12 — behaviour wins, but
 * only when it is strong, and a same-category, same-finish, same-price piece
 * still outranks a weakly co-viewed one from the other end of the shop.
 */
export const DEFAULT_WEIGHTS: Weights = {
  coPurchase: 8,
  coView: 4,
  sameCategory: 3,
  sharedCollection: 1.5,
  sameFinish: 1,
  sameGender: 0.75,
  occasionOverlap: 1.5,
  priceProximity: 2,
  rating: 0.75,
  bestseller: 0.5,
  newArrival: 0.25,
};

/** Fraction of slots the source product's own category may fill. */
export const DIVERSITY_SHARE = 0.6;

/**
 * Price band: candidates within this ratio of the source's price score full
 * marks, tapering to nothing at `PRICE_RATIO_LIMIT`×. Ratios rather than
 * rupee differences because ₹500 is a different gap at ₹900 than at ₹40,000.
 */
const PRICE_RATIO_FULL = 1.25;
const PRICE_RATIO_LIMIT = 3;

/** Bayesian damping for ratings: a product needs this many reviews to be trusted halfway. */
const RATING_PRIOR_COUNT = 5;

/**
 * Behavioural counts are damped so the first few co-occurrences matter most
 * and the hundredth barely moves the needle — a log curve, normalised against
 * the source's own volume (see the module comment).
 */
function behaviourStrength(count: number, ownVolume: number): number {
  if (count <= 0) return 0;
  // Share of the source's own buyers/viewers who also took the candidate,
  // damped so tiny volumes (1 of 1) do not read as certainty.
  const share = count / Math.max(ownVolume, count, 1);
  const confidence = 1 - 1 / (1 + Math.log1p(count));
  return Math.min(1, share) * confidence;
}

// ---------------------------------------------------------------------------
// Content similarity
// ---------------------------------------------------------------------------

export type ContentBreakdown = {
  sameCategory: boolean;
  sharedCollections: number;
  sameFinish: boolean;
  sameGender: boolean;
  occasionJaccard: number;
  priceProximity: number;
};

export function contentSimilarity(source: Product, candidate: Product): ContentBreakdown {
  const sharedCollections = candidate.collectionSlugs.filter((slug) =>
    source.collectionSlugs.includes(slug),
  ).length;

  const sourceOccasions = new Set(source.attributes.occasions);
  const candidateOccasions = new Set(candidate.attributes.occasions);
  const union = new Set([...sourceOccasions, ...candidateOccasions]).size;
  const intersection = [...sourceOccasions].filter((o) => candidateOccasions.has(o)).length;

  return {
    sameCategory: Boolean(source.categorySlug) && source.categorySlug === candidate.categorySlug,
    sharedCollections,
    sameFinish:
      Boolean(source.attributes.metal) && source.attributes.metal === candidate.attributes.metal,
    sameGender:
      Boolean(source.attributes.gender) && source.attributes.gender === candidate.attributes.gender,
    occasionJaccard: union === 0 ? 0 : intersection / union,
    priceProximity: priceProximity(source.price, candidate.price),
  };
}

/** 1 when prices are within `PRICE_RATIO_FULL`×, 0 beyond `PRICE_RATIO_LIMIT`×, linear in log-ratio between. */
export function priceProximity(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  const ratio = Math.abs(Math.log(a / b));
  const full = Math.log(PRICE_RATIO_FULL);
  const limit = Math.log(PRICE_RATIO_LIMIT);
  if (ratio <= full) return 1;
  if (ratio >= limit) return 0;
  return 1 - (ratio - full) / (limit - full);
}

/** Average rating pulled toward neutral until there are enough reviews to believe it. */
export function ratingPrior(ratingAvg: number, ratingCount: number): number {
  if (ratingCount <= 0 || ratingAvg <= 0) return 0;
  const trust = ratingCount / (ratingCount + RATING_PRIOR_COUNT);
  // Centre on 3.5 so a mediocre rating is a small penalty, not a small reward.
  return ((ratingAvg - 3.5) / 1.5) * trust;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export type Scored = {
  product: Product;
  score: number;
  /** Kept for debugging and tests — why did this rank where it did? */
  parts: {
    coPurchase: number;
    coView: number;
    content: number;
    prior: number;
  };
};

export function isPurchasable(product: Product): boolean {
  return product.variants.some((variant) => variant.stock > 0);
}

export function scoreCandidates(
  source: Product,
  catalogue: Product[],
  signals: Signals | null,
  weights: Weights = DEFAULT_WEIGHTS,
): Scored[] {
  const coPurchase = new Map((signals?.coPurchased ?? []).map((s) => [s.slug, s.count]));
  const coView = new Map((signals?.coViewed ?? []).map((s) => [s.slug, s.count]));
  const ownOrders = signals?.volume.orders ?? 0;
  const ownVisitors = signals?.volume.visitors ?? 0;

  return catalogue
    .filter((candidate) => candidate.slug !== source.slug && isPurchasable(candidate))
    .map((candidate) => {
      const c = contentSimilarity(source, candidate);

      const content =
        (c.sameCategory ? weights.sameCategory : 0) +
        Math.min(2, c.sharedCollections) * weights.sharedCollection +
        (c.sameFinish ? weights.sameFinish : 0) +
        (c.sameGender ? weights.sameGender : 0) +
        c.occasionJaccard * weights.occasionOverlap +
        c.priceProximity * weights.priceProximity;

      const prior =
        ratingPrior(candidate.ratingAvg, candidate.ratingCount) * weights.rating +
        (candidate.badges.includes("bestseller") ? weights.bestseller : 0) +
        (candidate.badges.includes("new") ? weights.newArrival : 0);

      const purchase =
        behaviourStrength(coPurchase.get(candidate.slug) ?? 0, ownOrders) * weights.coPurchase;
      const view = behaviourStrength(coView.get(candidate.slug) ?? 0, ownVisitors) * weights.coView;

      return {
        product: candidate,
        score: purchase + view + content + prior,
        parts: { coPurchase: purchase, coView: view, content, prior },
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        // Deterministic tie-break so the rail does not reshuffle between renders.
        b.product.createdAt.localeCompare(a.product.createdAt) ||
        a.product.slug.localeCompare(b.product.slug),
    );
}

// ---------------------------------------------------------------------------
// Diversity
// ---------------------------------------------------------------------------

/**
 * Picks `limit` from a scored list, best first, with two rules:
 *
 *   - the source's own category takes at most `ceil(limit × DIVERSITY_SHARE)`
 *     slots while candidates from other categories remain;
 *   - a (category, finish) pair already picked is skipped while a candidate
 *     with a different pair remains.
 *
 * Both rules relax when the pool runs dry, so a small catalogue still fills
 * the rail rather than showing three cards and a gap.
 */
export function diversify(source: Product, ranked: Scored[], limit: number): Product[] {
  if (limit <= 0) return [];

  const sameCategoryCap = Math.ceil(limit * DIVERSITY_SHARE);
  const picked: Scored[] = [];
  const remaining = [...ranked];
  const seenPairs = new Set<string>();
  let sameCategoryCount = 0;

  const pairKey = (p: Product) => `${p.categorySlug}|${p.attributes.metal ?? ""}`;

  // Pass 1: strict rules.
  for (const entry of remaining) {
    if (picked.length >= limit) break;

    const inSourceCategory = entry.product.categorySlug === source.categorySlug;
    if (inSourceCategory && sameCategoryCount >= sameCategoryCap) continue;
    if (seenPairs.has(pairKey(entry.product))) continue;

    picked.push(entry);
    seenPairs.add(pairKey(entry.product));
    if (inSourceCategory) sameCategoryCount += 1;
  }

  // Pass 2: relax the pair rule, keep the category cap.
  for (const entry of remaining) {
    if (picked.length >= limit) break;
    if (picked.includes(entry)) continue;
    const inSourceCategory = entry.product.categorySlug === source.categorySlug;
    if (inSourceCategory && sameCategoryCount >= sameCategoryCap) continue;
    picked.push(entry);
    if (inSourceCategory) sameCategoryCount += 1;
  }

  // Pass 3: anything at all, best first.
  for (const entry of remaining) {
    if (picked.length >= limit) break;
    if (!picked.includes(entry)) picked.push(entry);
  }

  return picked.map((entry) => entry.product);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function recommend(
  source: Product,
  catalogue: Product[],
  signals: Signals | null,
  options: { limit?: number; weights?: Weights } = {},
): Product[] {
  const limit = options.limit ?? 8;
  const ranked = scoreCandidates(source, catalogue, signals, options.weights ?? DEFAULT_WEIGHTS);
  return diversify(source, ranked, limit);
}
