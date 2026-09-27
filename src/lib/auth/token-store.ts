import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Where the session lives on the device.
 *
 * The site keeps its session in httpOnly cookies the browser manages. There is
 * no cookie jar here, so diva-backend hands the mobile client its tokens in
 * the response body (`X-Client: mobile` — see `lib/auth/deliver-session.ts`
 * there) and this module keeps them in the Keychain / Keystore.
 *
 * SecureStore has no web implementation; on web the app falls back to
 * localStorage so `expo start --web` still signs in. Nothing else in the app
 * knows which one is in use.
 */

const ACCESS_KEY = "diva.access";
const REFRESH_KEY = "diva.refresh";

export type Tokens = { accessToken: string; refreshToken: string };

let cached: Tokens | null | undefined;

async function read(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function write(key: string, value: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (value === null) globalThis.localStorage?.removeItem(key);
      else globalThis.localStorage?.setItem(key, value);
    } catch {
      // Private mode — the session simply won't persist.
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

export async function getTokens(): Promise<Tokens | null> {
  if (cached !== undefined) return cached;
  const [accessToken, refreshToken] = await Promise.all([read(ACCESS_KEY), read(REFRESH_KEY)]);
  cached = accessToken && refreshToken ? { accessToken, refreshToken } : null;
  return cached;
}

export async function setTokens(tokens: Tokens): Promise<void> {
  cached = tokens;
  await Promise.all([write(ACCESS_KEY, tokens.accessToken), write(REFRESH_KEY, tokens.refreshToken)]);
}

export async function clearTokens(): Promise<void> {
  cached = null;
  await Promise.all([write(ACCESS_KEY, null), write(REFRESH_KEY, null)]);
}
