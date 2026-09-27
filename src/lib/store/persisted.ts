import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * AsyncStorage-backed state, exposed as a React external store — the same
 * shape as the site's localStorage store so `store.tsx` is a near-verbatim
 * port. The read is asynchronous here, so `loaded` stays false for the first
 * few milliseconds and the UI avoids flashing an empty bag.
 */

export type CartLine = { productSlug: string; variantId: string; qty: number };

export type PersistedState = {
  cart: CartLine[];
  wishlist: string[];
  viewed: string[];
  couponCode: string | null;
  /** False until storage has been read — used to avoid flashing empty UI. */
  loaded: boolean;
};

const EMPTY: PersistedState = {
  cart: [],
  wishlist: [],
  viewed: [],
  couponCode: null,
  loaded: false,
};

const KEY = "diva.store.v1";

let state: PersistedState = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

async function readFromStorage(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, loaded: true };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      viewed: Array.isArray(parsed.viewed) ? parsed.viewed : [],
      couponCode: typeof parsed.couponCode === "string" ? parsed.couponCode : null,
      loaded: true,
    };
  } catch {
    return { ...EMPTY, loaded: true };
  }
}

function writeToStorage(next: PersistedState) {
  AsyncStorage.setItem(
    KEY,
    JSON.stringify({
      cart: next.cart,
      wishlist: next.wishlist,
      viewed: next.viewed,
      couponCode: next.couponCode,
    }),
  ).catch(() => {
    // Storage full or unavailable — the session simply won't persist.
  });
}

export function subscribe(onStoreChange: () => void) {
  if (!started) {
    started = true;
    void readFromStorage().then((loaded) => {
      // A mutation may have landed before the read finished; it wins.
      state = state.loaded ? state : loaded;
      notify();
    });
  }
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSnapshot(): PersistedState {
  return state;
}

/** Apply a change and notify subscribers. Safe to call from event handlers. */
export function mutate(updater: (current: PersistedState) => Partial<PersistedState>): void {
  const patch = updater(state);
  if (Object.keys(patch).length === 0) return;
  const next = { ...state, ...patch, loaded: true };
  state = next;
  writeToStorage(next);
  notify();
}
