import { apiGetOrNull } from "@/lib/api/client";
import { cdnImage, IMG } from "@/lib/images";
import type { Category, Collection, HeroSlide, Occasion, Product, Review, Testimonial, Variant } from "@/lib/types";
import { OCCASION_LABELS } from "@/lib/data/occasions";
import type { Signals } from "@/lib/recommendations/score";

/**
 * The catalogue, from the backend — a port of the site's server-only
 * `lib/data/catalogue.ts` and `lib/data/hero.ts`. Same mapping, same
 * tolerance for a dead backend (an empty shelf, never a crash).
 */

type ApiImage = { url: string; alt: string };

type ApiVariant = {
  _id: string;
  sku: string;
  colour: string;
  size?: string;
  stock: number;
  reservedStock: number;
  isActive: boolean;
};

type ApiProduct = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryIds: string[];
  collectionIds?: string[];
  images: ApiImage[];
  videoUrl?: string | null;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  variants: ApiVariant[];
  attributes?: { gender?: string; occasions?: string[]; certification?: string };
  shippingReturns?: string;
  careInstructions?: string;
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
};

type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ApiImage;
  bannerImage?: ApiImage;
  displayOrder: number;
};

type ApiCollection = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: ApiImage;
};

type ApiReview = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: ApiImage[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reply?: { body: string; repliedAt: string } | null;
  createdAt: string;
  authorName: string;
};

type ApiHeroSlide = {
  _id: string;
  heading: string;
  subtitle: string;
  image: { url: string; alt: string };
  cta: { label: string; href: string };
};

function titleCase(token: string | undefined | null): string {
  if (!token) return "";
  return token
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const GENDER_LABELS: Record<string, Product["attributes"]["gender"]> = {
  WOMEN: "Women",
  MEN: "Men",
  UNISEX: "Unisex",
  KIDS: "Kids",
};

function toVariant(variant: ApiVariant): Variant {
  return {
    id: variant._id,
    label: variant.size?.trim() || titleCase(variant.colour) || "Default",
    sku: variant.sku,
    stock: Math.max(0, variant.stock - variant.reservedStock),
    priceDelta: 0,
    colour: variant.colour,
  };
}

export type SlugMaps = { categories: Map<string, string>; collections: Map<string, string> };

export function toProduct(product: ApiProduct, slugs: SlugMaps): Product {
  const variants = product.variants.filter((variant) => variant.isActive).map(toVariant);
  const colours = [...new Set(product.variants.map((variant) => variant.colour))];

  const badges: Product["badges"] = [];
  if (product.isNewArrival) badges.push("new");
  if (product.isFeatured) badges.push("bestseller");

  return {
    id: product._id,
    slug: product.slug,
    title: product.title,
    subtitle: product.shortDescription ?? "",
    description: product.description ?? "",
    shippingReturns: product.shippingReturns,
    careInstructions: product.careInstructions,
    categorySlug: slugs.categories.get(product.categoryIds?.[0] ?? "") ?? "",
    collectionSlugs: (product.collectionIds ?? [])
      .map((id) => slugs.collections.get(id))
      .filter((slug): slug is string => Boolean(slug)),
    price: product.pricePaise,
    mrp: product.compareAtPricePaise ?? product.pricePaise,
    images: product.images?.map((image) => cdnImage(image.url, IMG.full)) ?? [],
    videoUrl: product.videoUrl ?? undefined,
    attributes: {
      metal: colours.length === 1 && colours[0] ? titleCase(colours[0]) : undefined,
      gender: product.attributes?.gender ? GENDER_LABELS[product.attributes.gender] : undefined,
      occasions: (product.attributes?.occasions ?? [])
        .map((occasion) => OCCASION_LABELS[occasion as keyof typeof OCCASION_LABELS])
        .filter((occasion): occasion is Occasion => Boolean(occasion)),
      certification: product.attributes?.certification,
    },
    variantLabel: product.variants.some((variant) => variant.size?.trim()) ? "Size" : "Colour",
    variants,
    ratingAvg: product.ratingAvg ?? 0,
    ratingCount: product.ratingCount ?? 0,
    badges,
    createdAt: product.createdAt,
  };
}

function toCategory(category: ApiCategory): Category {
  return {
    slug: category.slug,
    name: category.name,
    blurb: category.description ?? "",
    image: cdnImage(category.image?.url ?? "", IMG.full),
    bannerImage: cdnImage(category.bannerImage?.url || category.image?.url || "", IMG.full),
    displayOrder: category.displayOrder ?? 0,
  };
}

function toCollection(collection: ApiCollection): Collection {
  return {
    slug: collection.slug,
    name: collection.name,
    tagline: collection.description ?? "",
    description: collection.description ?? "",
    image: cdnImage(collection.bannerImage?.url ?? "", IMG.full),
  };
}

export type CatalogueSnapshot = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  heroSlides: HeroSlide[];
  /** Backend id → slug, kept so a later detail fetch can be mapped the same way. */
  slugs: SlugMaps;
};

/**
 * Everything the app needs on launch, in one round of parallel requests:
 * products, both taxonomies and the hero slides.
 */
export async function fetchCatalogue(): Promise<CatalogueSnapshot> {
  const [rawProducts, rawCategories, rawCollections, rawSlides] = await Promise.all([
    apiGetOrNull<{ items: ApiProduct[] } | ApiProduct[]>("/products?limit=100&sort=newest"),
    apiGetOrNull<ApiCategory[]>("/categories"),
    apiGetOrNull<ApiCollection[]>("/collections"),
    apiGetOrNull<ApiHeroSlide[]>("/hero-slides"),
  ]);

  const categoriesList = rawCategories ?? [];
  const collectionsList = rawCollections ?? [];
  const slugs: SlugMaps = {
    categories: new Map(categoriesList.map((entry) => [entry._id, entry.slug])),
    collections: new Map(collectionsList.map((entry) => [entry._id, entry.slug])),
  };

  const items = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.items ?? []);

  return {
    products: items.map((product) => toProduct(product, slugs)),
    categories: categoriesList.map(toCategory),
    collections: collectionsList.map(toCollection),
    slugs,
    heroSlides: (rawSlides ?? []).map((slide) => ({
      id: slide._id,
      heading: slide.heading,
      subtitle: slide.subtitle,
      image: cdnImage(slide.image.url, IMG.full),
      imageAlt: slide.image.alt,
      cta: slide.cta,
    })),
  };
}

/** One product with the fields only the detail endpoint carries. */
export async function fetchProduct(slug: string, slugs: SlugMaps): Promise<Product | null> {
  const detail = await apiGetOrNull<ApiProduct>(`/products/${encodeURIComponent(slug)}`);
  return detail ? toProduct(detail, slugs) : null;
}

/** Approved reviews for one product. */
export async function fetchProductReviews(slug: string): Promise<Review[]> {
  const reviews = await apiGetOrNull<ApiReview[]>(`/products/${encodeURIComponent(slug)}/reviews`);

  return (reviews ?? []).map((review) => ({
    id: review._id,
    productSlug: slug,
    author: review.authorName,
    rating: review.rating,
    title: review.title ?? "",
    body: review.body ?? "",
    date: review.createdAt,
    verifiedPurchase: review.isVerifiedPurchase,
    images: review.images?.map((image) => cdnImage(image.url, IMG.thumb)),
    helpfulCount: review.helpfulCount,
    reply: review.reply ? { body: review.reply.body, at: review.reply.repliedAt } : null,
  }));
}

/** Behavioural counts for "You may also like". Allowed to fail. */
export function fetchSignals(slug: string): Promise<Signals | null> {
  return apiGetOrNull<Signals>(`/products/${encodeURIComponent(slug)}/signals`);
}

type ApiFeaturedReview = {
  _id: string;
  rating: number;
  body?: string;
  authorName: string;
  city?: string;
  product?: { title: string; slug: string } | null;
};

export type FeaturedReviews = {
  testimonials: Testimonial[];
  /** Store-wide approved review count and average; null until any exist. */
  summary: { ratingAvg: number; ratingCount: number } | null;
};

/**
 * The homepage's "What customers actually say" — reviews staff have starred
 * in the admin. Allowed to fail: the caller falls back to the static copy.
 */
export async function fetchFeaturedReviews(): Promise<FeaturedReviews | null> {
  const data = await apiGetOrNull<{ items: ApiFeaturedReview[]; summary: { ratingAvg: number; ratingCount: number } }>(
    "/reviews/featured",
  );
  if (!data) return null;

  return {
    testimonials: data.items
      .filter((review) => review.body?.trim())
      .map((review) => ({
        id: review._id,
        name: review.authorName,
        city: review.city ?? review.product?.title ?? "",
        quote: review.body!.trim(),
        rating: review.rating,
      })),
    summary: data.summary.ratingCount > 0 ? data.summary : null,
  };
}
