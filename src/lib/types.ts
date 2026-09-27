/**
 * Shapes for the storefront — identical to diva-frontend's `lib/types.ts`, so
 * the two clients read the same backend the same way. Money is always paise
 * (integers).
 */

export type Metal =
  | "22K Gold"
  | "18K Gold"
  | "14K Rose Gold"
  | "Platinum"
  | "925 Silver";

export type Stone =
  | "Diamond"
  | "Ruby"
  | "Emerald"
  | "Sapphire"
  | "Pearl"
  | "Uncut Polki"
  | "None";

export type Gender = "Women" | "Men" | "Unisex" | "Kids";

/**
 * The backend's occasion tokens — the "Occasions" chips on the admin's
 * add-product page. Mirrors `OCCASIONS` in the backend's `models/enums.ts`.
 */
export type OccasionKey =
  | "DAILY_WEAR"
  | "WEDDING"
  | "ENGAGEMENT"
  | "FESTIVAL"
  | "PARTY"
  | "OFFICE"
  | "GIFT";

/** The same seven, as shown to a shopper. See `lib/data/occasions.ts`. */
export type Occasion =
  | "Daily Wear"
  | "Wedding"
  | "Engagement"
  | "Festival"
  | "Party"
  | "Office"
  | "Gift";

export type Variant = {
  id: string;
  /** Size / colour label shown on the PDP, e.g. "16" or "Rose Gold". */
  label: string;
  sku: string;
  stock: number;
  /** Added to the parent price, in paise. Always 0 in the fixed-price catalogue. */
  priceDelta: number;
  colour?: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  collectionSlugs: string[];
  /** Base price in paise, before variant delta. */
  price: number;
  /** Struck-through list price in paise. */
  mrp: number;
  images: string[];
  videoUrl?: string | null;
  attributes: {
    metal?: string;
    purity?: string;
    stone?: string;
    stoneWeight?: string;
    grossWeight?: string;
    gender?: Gender;
    occasions: Occasion[];
    huid?: string;
    certification?: string;
  };
  variantLabel: string;
  variants: Variant[];
  ratingAvg: number;
  ratingCount: number;
  badges: ("new" | "bestseller" | "limited")[];
  shippingReturns?: string;
  careInstructions?: string;
  /** ISO date — drives the "New Arrivals" sort. */
  createdAt: string;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  /** Square tile — nav rails, category grids. */
  image: string;
  /** Wide hero — the category landing page's header banner. */
  bannerImage: string;
  displayOrder: number;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

/**
 * A storefront collection backed by an occasion rather than an admin-created
 * collection: the `/collections` pages and the home banner list these.
 */
export type OccasionCollection = Omit<Collection, "name"> & {
  key: OccasionKey;
  /** Also the value a product carries in `attributes.occasions`. */
  name: Occasion;
};

export type Review = {
  id: string;
  productSlug: string;
  author: string;
  city?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verifiedPurchase: boolean;
  images?: string[];
  helpfulCount?: number;
  reply?: { body: string; at: string } | null;
};

export type HeroCta = { label: string; href: string };

export type HeroSlide = {
  id: string;
  heading: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  cta: HeroCta;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  author: string;
  readMinutes: number;
  publishedAt: string;
  tag: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
};
