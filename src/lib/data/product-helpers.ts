import type { Product } from "@/lib/types";

/** Catalogue lookups, as pure functions over a list. */

export function findBySlug(list: Product[], slug: string): Product | undefined {
  return list.find((product) => product.slug === slug);
}

export function byCategory(list: Product[], slug: string): Product[] {
  return list.filter((product) => product.categorySlug === slug);
}

export function byCollection(list: Product[], slug: string): Product[] {
  return list.filter((product) => product.collectionSlugs.includes(slug));
}

export function byBadge(list: Product[], badge: Product["badges"][number]): Product[] {
  return list.filter((product) => product.badges.includes(badge));
}

export function search(list: Product[], query: string): Product[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return list.filter((product) =>
    [
      product.title,
      product.subtitle,
      product.categorySlug,
      product.attributes.metal,
      product.attributes.stone,
      ...product.attributes.occasions,
      ...product.variants.map((variant) => variant.label),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

/** The price shown on a card. */
export function fromPrice(product: Product): number {
  const deltas = product.variants.map((variant) => variant.priceDelta);
  return product.price + (deltas.length ? Math.min(...deltas) : 0);
}
