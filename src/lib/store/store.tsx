import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useProductLookup, useProductLookupById } from "@/lib/data/catalogue-context";
import { computeTotals, type CartTotals, type ResolvedLine } from "@/lib/totals";
import { useAuth } from "@/lib/auth/auth-context";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { getSnapshot, mutate, subscribe } from "@/lib/store/persisted";

/**
 * Client-side store — a port of the site's `lib/store/store.tsx`. Cart,
 * recently-viewed and coupons live on the device; the wishlist is local for
 * guests and the account's `/wishlist` for signed-in customers, merged once
 * on sign-in.
 *
 * Also owns the transient surfaces the root layout renders: the cart drawer,
 * the mobile nav, the search overlay and the toasts.
 */

type Toast = { id: number; message: string; href?: string; linkLabel?: string };

/**
 * Three contexts, not one, because of who consumes them.
 *
 * `<Link>` sits inside every product card, nav item and button, and only ever
 * needs the *setters* — which never change. Putting `cartOpen` or `toasts` in
 * the same context as those setters meant that opening the bag, or a toast
 * auto-dismissing four seconds later, re-rendered every link on the screen on
 * the same frame the drawer started sliding. Splitting by change-frequency
 * means the drawer, menu and toaster are the only things that re-render when
 * they open.
 */

/** Cart, wishlist and recently-viewed — changes when the customer acts. */
type StoreData = {
  hydrated: boolean;
  lines: ResolvedLine[];
  totals: CartTotals;
  wishlist: string[];
  toggleWishlist: (productSlug: string) => void;
  isWishlisted: (productSlug: string) => boolean;
  recentlyViewed: string[];
  coupon: string | null;
};

/** Stable for the lifetime of the provider — subscribing costs nothing. */
type StoreActions = {
  addToCart: (productSlug: string, variantId: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  markViewed: (productSlug: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setCartOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  notify: (message: string, opts?: { href?: string; linkLabel?: string }) => void;
};

/** The transient surfaces — changes on every open / close / toast. */
type StoreUI = {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  toasts: Toast[];
};

type StoreValue = StoreData & StoreActions;

const StoreContext = createContext<StoreValue | null>(null);
const StoreActionsContext = createContext<StoreActions | null>(null);
const StoreUIContext = createContext<StoreUI | null>(null);

function lineKey(productSlug: string, variantId: string) {
  return `${productSlug}::${variantId}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { cart, wishlist: localWishlist, viewed, couponCode, loaded } = persisted;

  const getProduct = useProductLookup();

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, opts?: { href?: string; linkLabel?: string }) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ---------------------------------------------------------------------
  // Wishlist: on-device for guests, the account for signed-in customers.
  // ---------------------------------------------------------------------

  const { status: authStatus } = useAuth();
  const getProductById = useProductLookupById();

  const [serverWishlist, setServerWishlist] = useState<string[] | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const mergedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (authStatus !== "authenticated") {
        if (!cancelled) setServerWishlist(null);
        mergedRef.current = false;
        return;
      }

      if (mergedRef.current) return;
      mergedRef.current = true;

      setWishlistLoading(true);
      try {
        const remote = await getWishlist();
        const remoteIds = new Set(remote.map((item) => item.productId));

        const guestSlugs = getSnapshot().wishlist;
        const merges = guestSlugs.flatMap((slug) => {
          const product = getProduct(slug);
          if (!product || remoteIds.has(product.id)) return [];
          return [addToWishlist(product.id).catch(() => null)];
        });

        if (merges.length > 0) await Promise.all(merges);
        if (cancelled) return;

        mutate(() => ({ wishlist: [] }));

        const finalRemote = merges.length > 0 ? await getWishlist() : remote;
        if (cancelled) return;

        const slugs = finalRemote
          .map((item) => getProductById(item.productId)?.slug)
          .filter((slug): slug is string => Boolean(slug));

        setServerWishlist(slugs);
      } catch {
        if (!cancelled) setServerWishlist(null);
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  const wishlist = useMemo(
    () => (authStatus === "authenticated" ? (serverWishlist ?? []) : localWishlist),
    [authStatus, serverWishlist, localWishlist],
  );

  const toggleWishlist = useCallback(
    (productSlug: string) => {
      if (authStatus === "authenticated") {
        const product = getProduct(productSlug);
        if (!product) return;

        const has = (serverWishlist ?? []).includes(productSlug);

        setServerWishlist((current) => {
          const base = current ?? [];
          return has ? base.filter((s) => s !== productSlug) : [productSlug, ...base];
        });

        const request = has ? removeFromWishlist(product.id) : addToWishlist(product.id);

        request.catch(() => {
          setServerWishlist((current) => {
            const base = current ?? [];
            return has ? [productSlug, ...base] : base.filter((s) => s !== productSlug);
          });
          notify("Could not update your wishlist. Please try again.");
        });

        notify(has ? "Removed from wishlist" : "Saved to your wishlist", {
          href: has ? undefined : "/wishlist",
          linkLabel: has ? undefined : "View wishlist",
        });
        return;
      }

      const has = localWishlist.includes(productSlug);
      mutate((current) => ({
        wishlist: has
          ? current.wishlist.filter((s) => s !== productSlug)
          : [productSlug, ...current.wishlist],
      }));
      notify(has ? "Removed from wishlist" : "Saved to your wishlist", {
        href: has ? undefined : "/wishlist",
        linkLabel: has ? undefined : "View wishlist",
      });
    },
    [authStatus, serverWishlist, localWishlist, getProduct, notify],
  );

  const isWishlisted = useCallback((productSlug: string) => wishlist.includes(productSlug), [wishlist]);

  const lines = useMemo<ResolvedLine[]>(
    () =>
      cart.flatMap((line) => {
        const product = getProduct(line.productSlug);
        if (!product) return [];
        const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
        if (!variant) return [];
        const unitPrice = product.price + variant.priceDelta;
        return [
          {
            key: lineKey(product.slug, variant.id),
            product,
            variant,
            qty: line.qty,
            unitPrice,
            unitMrp: product.mrp + variant.priceDelta,
            lineTotal: unitPrice * line.qty,
          },
        ];
      }),
    [cart, getProduct],
  );

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const addToCart = useCallback((productSlug: string, variantId: string, qty = 1) => {
    mutate((current) => {
      const existing = current.cart.find(
        (l) => l.productSlug === productSlug && l.variantId === variantId,
      );
      return {
        cart: existing
          ? current.cart.map((l) => (l === existing ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
          : [...current.cart, { productSlug, variantId, qty }],
      };
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    mutate((current) => ({
      cart: current.cart
        .map((l) =>
          lineKey(l.productSlug, l.variantId) === key
            ? { ...l, qty: Math.max(0, Math.min(10, qty)) }
            : l,
        )
        .filter((l) => l.qty > 0),
    }));
  }, []);

  const removeLine = useCallback((key: string) => {
    mutate((current) => ({
      cart: current.cart.filter((l) => lineKey(l.productSlug, l.variantId) !== key),
    }));
  }, []);

  const clearCart = useCallback(() => {
    mutate(() => ({ cart: [], couponCode: null }));
  }, []);

  const markViewed = useCallback((productSlug: string) => {
    mutate((current) =>
      current.viewed[0] === productSlug
        ? {}
        : { viewed: [productSlug, ...current.viewed.filter((s) => s !== productSlug)].slice(0, 8) },
    );
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const normalised = code.trim().toUpperCase();
    if (!normalised) return { ok: false, message: "Enter a code." };
    mutate(() => ({ couponCode: normalised }));
    return { ok: true, message: `${normalised} will be applied at checkout.` };
  }, []);

  const removeCoupon = useCallback(() => {
    mutate(() => ({ couponCode: null }));
  }, []);

  const actions = useMemo<StoreActions>(
    () => ({
      addToCart,
      setQty,
      removeLine,
      clearCart,
      markViewed,
      applyCoupon,
      removeCoupon,
      setCartOpen,
      setMenuOpen,
      setSearchOpen,
      notify,
    }),
    [addToCart, setQty, removeLine, clearCart, markViewed, applyCoupon, removeCoupon, notify],
  );

  const hydrated = loaded && !wishlistLoading;
  const value = useMemo<StoreValue>(
    () => ({
      ...actions,
      hydrated,
      lines,
      totals,
      wishlist,
      toggleWishlist,
      isWishlisted,
      recentlyViewed: viewed,
      coupon: couponCode,
    }),
    [actions, hydrated, lines, totals, wishlist, toggleWishlist, isWishlisted, viewed, couponCode],
  );

  const ui = useMemo<StoreUI>(
    () => ({ cartOpen, menuOpen, searchOpen, toasts }),
    [cartOpen, menuOpen, searchOpen, toasts],
  );

  return (
    <StoreActionsContext.Provider value={actions}>
      <StoreUIContext.Provider value={ui}>
        <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
      </StoreUIContext.Provider>
    </StoreActionsContext.Provider>
  );
}

/** Cart / wishlist data plus every action. Does not re-render on drawer or toast changes. */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Only the setters. Never triggers a re-render — use this in `<Link>` and anything rendered in bulk. */
export function useStoreActions() {
  const ctx = useContext(StoreActionsContext);
  if (!ctx) throw new Error("useStoreActions must be used inside <StoreProvider>");
  return ctx;
}

/** Open / closed state of the bag, menu and search, and the toast queue. */
export function useStoreUI() {
  const ctx = useContext(StoreUIContext);
  if (!ctx) throw new Error("useStoreUI must be used inside <StoreProvider>");
  return ctx;
}
