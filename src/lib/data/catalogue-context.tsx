import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Category, Collection, HeroSlide, Product } from "@/lib/types";
import { fetchCatalogue, type SlugMaps } from "@/lib/api/catalogue";
import { fallbackSiteSettings, fetchSiteSettings, type SiteSettings } from "@/lib/data/site";
import { findBySlug, search } from "@/lib/data/product-helpers";

/**
 * The catalogue, for every screen.
 *
 * The site's root layout reads the catalogue once on the server and hands it
 * down; here the root layout fetches it once on launch and hands it down the
 * same way. The cart, wishlist, recently-viewed rail and search overlay all
 * resolve a stored slug against this list — one source of truth, one request.
 */

type CatalogueValue = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  heroSlides: HeroSlide[];
  settings: SiteSettings;
  slugs: SlugMaps;
  /** False until the first load has settled — successfully or not. */
  ready: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

const CatalogueContext = createContext<CatalogueValue | null>(null);

export function CatalogueProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(fallbackSiteSettings);
  const [slugs, setSlugs] = useState<SlugMaps>({ categories: new Map(), collections: new Map() });
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [snapshot, siteSettings] = await Promise.all([fetchCatalogue(), fetchSiteSettings()]);
    setProducts(snapshot.products);
    setCategories([...snapshot.categories].sort((a, b) => a.displayOrder - b.displayOrder));
    setCollections(snapshot.collections);
    setHeroSlides(snapshot.heroSlides);
    setSlugs(snapshot.slugs);
    setSettings(siteSettings);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const value = useMemo(
    () => ({ products, categories, collections, heroSlides, settings, slugs, ready, refreshing, refresh }),
    [products, categories, collections, heroSlides, settings, slugs, ready, refreshing, refresh],
  );

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

function useCatalogueContext(): CatalogueValue {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error("useCatalogue must be used inside <CatalogueProvider>");
  return ctx;
}

/** Every product the storefront knows about. */
export function useCatalogue(): Product[] {
  return useCatalogueContext().products;
}

export function useCatalogueState() {
  const { ready, refreshing, refresh } = useCatalogueContext();
  return { ready, refreshing, refresh };
}

export function useCategories(): Category[] {
  return useCatalogueContext().categories;
}

export function useCollections(): Collection[] {
  return useCatalogueContext().collections;
}

export function useHeroSlides(): HeroSlide[] {
  return useCatalogueContext().heroSlides;
}

export function useSiteSettings(): SiteSettings {
  return useCatalogueContext().settings;
}

/** Resolves a stored slug — a cart line, a wishlist entry — to a product. */
export function useProductLookup(): (slug: string) => Product | undefined {
  const catalogue = useCatalogue();
  return useMemo(() => {
    const bySlug = new Map(catalogue.map((product) => [product.slug, product]));
    return (slug: string) => bySlug.get(slug);
  }, [catalogue]);
}

/** Same as `useProductLookup`, keyed by id — the account wishlist stores ids. */
export function useProductLookupById(): (id: string) => Product | undefined {
  const catalogue = useCatalogue();
  return useMemo(() => {
    const byId = new Map(catalogue.map((product) => [product.id, product]));
    return (id: string) => byId.get(id);
  }, [catalogue]);
}

export function useProductSearch(query: string): Product[] {
  const catalogue = useCatalogue();
  return useMemo(() => search(catalogue, query), [catalogue, query]);
}

/** id → slug maps, so a product fetched on its own can name the edits it is in. */
export function useSlugMaps(): SlugMaps {
  return useCatalogueContext().slugs;
}

export { findBySlug };
