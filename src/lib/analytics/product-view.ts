import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { backendUrl } from "@/lib/api/client";
import { getTokens } from "@/lib/auth/token-store";

/**
 * The product-page view beacon. Fire-and-forget: nothing here is awaited by
 * the screen, nothing here can throw into it, and a failed request is simply a
 * view that was not counted.
 *
 * Identity is an opaque random id minted once per install. It is not a
 * fingerprint and is not sent anywhere else.
 */

const VISITOR_KEY = "diva.vid";
const seenThisSession = new Set<string>();

async function visitorId(): Promise<string | null> {
  try {
    const existing = await AsyncStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = Crypto.randomUUID();
    await AsyncStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}

export function recordProductView(slug: string): void {
  if (seenThisSession.has(slug)) return;
  seenThisSession.add(slug);

  void (async () => {
    const id = await visitorId();
    if (!id) return;

    const headers: Record<string, string> = {
      "content-type": "application/json",
      "X-Client": "mobile",
    };
    const tokens = await getTokens();
    if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

    await fetch(backendUrl(`/products/${encodeURIComponent(slug)}/view`), {
      method: "POST",
      headers,
      body: JSON.stringify({ visitorId: id }),
    }).catch(() => {
      // Deliberately swallowed — see the module comment.
    });
  })().catch(() => {});
}
