import type { Product } from "@/lib/types";
import { discountPercent, rupees } from "@/lib/format";

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount";

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "New arrivals" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Highest rated" },
  { key: "discount", label: "Biggest discount" },
];

export const priceBands = [
  { key: "0-25000", label: "Under ₹25,000", min: 0, max: rupees(25000) },
  { key: "25000-50000", label: "₹25,000 – ₹50,000", min: rupees(25000), max: rupees(50000) },
  { key: "50000-100000", label: "₹50,000 – ₹1,00,000", min: rupees(50000), max: rupees(100000) },
  { key: "100000-9999999", label: "Above ₹1,00,000", min: rupees(100000), max: Infinity },
];

export type FilterState = {
  price: string[];
  metal: string[];
  stone: string[];
  occasion: string[];
  gender: string[];
  category: string[];
  availability: string[];
  rating: string[];
  sort: SortKey;
};

export const emptyFilters: FilterState = {
  price: [],
  metal: [],
  stone: [],
  occasion: [],
  gender: [],
  category: [],
  availability: [],
  rating: [],
  sort: "featured",
};

export const facetKeys = [
  "price",
  "metal",
  "stone",
  "occasion",
  "gender",
  "category",
  "availability",
  "rating",
] as const;

export type FacetKey = (typeof facetKeys)[number];

function valuesFor(product: Product, facet: FacetKey): string[] {
  switch (facet) {
    case "price":
      return priceBands
        .filter((b) => product.price >= b.min && product.price < b.max)
        .map((b) => b.key);
    case "metal":
      return product.attributes.metal ? [product.attributes.metal] : [];
    case "stone":
      return product.attributes.stone ? [product.attributes.stone] : [];
    case "occasion":
      return product.attributes.occasions;
    case "gender":
      return product.attributes.gender ? [product.attributes.gender] : [];
    case "category":
      return [product.categorySlug];
    case "availability":
      return product.variants.some((v) => v.stock > 0) ? ["in-stock"] : ["made-to-order"];
    case "rating":
      return ["4", "4.5"].filter((min) => product.ratingAvg >= Number(min));
  }
}

function matchesFacet(product: Product, facet: FacetKey, selected: string[]) {
  if (selected.length === 0) return true;
  const values = valuesFor(product, facet);
  return selected.some((s) => values.includes(s));
}

export function applyFilters(products: Product[], state: FilterState): Product[] {
  const filtered = products.filter((p) =>
    facetKeys.every((facet) => matchesFacet(p, facet, state[facet])),
  );
  return sortProducts(filtered, state.sort);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount);
    case "discount":
      return copy.sort(
        (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
      );
    default:
      return copy.sort(
        (a, b) =>
          Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")) ||
          b.ratingCount - a.ratingCount,
      );
  }
}

/** Count how many products each option would yield, holding the *other* facets fixed. */
export function facetCounts(
  products: Product[],
  state: FilterState,
  facet: FacetKey,
): Record<string, number> {
  const others = facetKeys.filter((f) => f !== facet);
  const pool = products.filter((p) => others.every((f) => matchesFacet(p, f, state[f])));
  const counts: Record<string, number> = {};
  for (const p of pool) {
    for (const value of valuesFor(p, facet)) {
      counts[value] = (counts[value] ?? 0) + 1;
    }
  }
  return counts;
}

/** Read filter state out of route params such as `{ price: "0-25000", sort: "newest" }`. */
export function filtersFromParams(
  params: Record<string, string | string[] | undefined>,
): FilterState {
  const list = (key: FacetKey) => {
    const raw = params[key];
    if (!raw) return [];
    return (Array.isArray(raw) ? raw : raw.split(",")).filter(Boolean);
  };
  const rawSort = params.sort;
  const sortValue = Array.isArray(rawSort) ? rawSort[0] : rawSort;
  const sort = sortOptions.find((o) => o.key === sortValue)?.key ?? "featured";

  return {
    price: list("price"),
    metal: list("metal"),
    stone: list("stone"),
    occasion: list("occasion"),
    gender: list("gender"),
    category: list("category"),
    availability: list("availability"),
    rating: list("rating"),
    sort: sort === "featured" && sortValue === "popular" ? "featured" : sort,
  };
}

export function activeFilterCount(state: FilterState): number {
  return facetKeys.reduce((n, key) => n + state[key].length, 0);
}
