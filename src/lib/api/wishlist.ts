import { apiFetch } from "@/lib/api/client";

/**
 * The account-backed wishlist. Returns bare `productId`s, not resolved
 * products — the storefront already holds the full catalogue client-side
 * (`catalogue-context.tsx`), so resolving one is a local lookup, not a second
 * round trip. See `lib/store/store.tsx` for where this is consumed.
 */

export type WishlistEntry = { productId: string; addedAt: string };

export function getWishlist() {
  return apiFetch<WishlistEntry[]>("/wishlist");
}

export function addToWishlist(productId: string) {
  return apiFetch<WishlistEntry[]>("/wishlist", { method: "POST", body: { productId } });
}

export function removeFromWishlist(productId: string) {
  return apiFetch<WishlistEntry[]>(`/wishlist/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}
