import type { Occasion, OccasionCollection, OccasionKey, Product } from "@/lib/types";
import { MODEL, STILL } from "@/lib/images";

/**
 * The storefront's collections are the backend's occasions.
 *
 * The keys mirror `OCCASIONS` in the backend's `models/enums.ts` — the same
 * seven chips an admin ticks under "Occasions" on the add-product page. Tagging
 * a product there is what puts it in the matching edit here, so the shelves
 * fill themselves rather than needing a second "collection" assigned by hand.
 *
 * Ported from the web's `lib/data/occasions.ts` — the home banner, the
 * Collections screens, the footer and the filter chips all read this one list,
 * so they can never disagree about what an occasion is called.
 */
export const occasionCollections: OccasionCollection[] = [
  {
    key: "DAILY_WEAR",
    slug: "daily-wear",
    name: "Daily Wear",
    tagline: "Everyday elegance",
    description:
      "Light, easy pieces made to be put on in the morning and forgotten about — until someone asks where you got them.",
    image: MODEL.daintyWhite,
  },
  {
    key: "WEDDING",
    slug: "wedding",
    name: "Wedding",
    tagline: "The bridal edit",
    description:
      "Statement sets and heirloom-weight pieces for the ceremony, the reception and every function in between.",
    image: STILL.bridalNecklace,
  },
  {
    key: "ENGAGEMENT",
    slug: "engagement",
    name: "Engagement",
    tagline: "For the yes",
    description:
      "Rings and pairs built around a single moment — solitaires, halos and the bands that go with them.",
    image: STILL.solitaireRing,
  },
  {
    key: "FESTIVAL",
    slug: "festival",
    name: "Festival",
    tagline: "Festive radiance",
    description:
      "Temple work, jhumkas and layered chains that catch the light at Diwali, Navratri and every celebration after.",
    image: STILL.templeSet,
  },
  {
    key: "PARTY",
    slug: "party",
    name: "Party",
    tagline: "After dark",
    description:
      "Bold hoops, chandeliers and stacked bangles for evenings that deserve a little more shine.",
    image: STILL.chandelierEarrings,
  },
  {
    key: "OFFICE",
    slug: "office",
    name: "Office",
    tagline: "Quietly polished",
    description:
      "Studs, fine chains and slim bands that read as considered rather than loud — from the first meeting to the last.",
    image: MODEL.pearlShirt,
  },
  {
    key: "GIFT",
    slug: "gift",
    name: "Gift",
    tagline: "The gifting suite",
    description:
      "Pieces chosen because they suit almost anyone, boxed and ready for birthdays, anniversaries and thank-yous.",
    image: STILL.ringInBox,
  },
];

/** Backend token → the label shown on chips, spec tables and collection pages. */
export const OCCASION_LABELS = Object.fromEntries(
  occasionCollections.map((collection) => [collection.key, collection.name]),
) as Record<OccasionKey, Occasion>;

/** Every label, in display order — the filter panel's occasion chips. */
export const occasionNames: Occasion[] = occasionCollections.map((collection) => collection.name);

export function getOccasionCollection(slug: string): OccasionCollection | undefined {
  return occasionCollections.find((collection) => collection.slug === slug);
}

/**
 * Products tagged with an occasion.
 *
 * Pure over a list, like the helpers in `product-helpers.ts`.
 */
export function byOccasion(list: Product[], collection: OccasionCollection): Product[] {
  return list.filter((product) => product.attributes.occasions.includes(collection.name));
}
