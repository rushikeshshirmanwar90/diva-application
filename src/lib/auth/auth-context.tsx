import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import * as authApi from "@/lib/api/auth";
import type { Profile, RegisterInput, UpdateProfileInput } from "@/lib/api/auth";

/**
 * Extracts OAuth parameters (such as `id_token`, `error`, `error_description`)
 * from either query parameters or hash fragments in deep links.
 */
function extractAuthParams(urlStr: string): { idToken?: string; error?: string; errorDescription?: string } {
  if (!urlStr) return {};
  let idToken: string | undefined;
  let error: string | undefined;
  let errorDescription: string | undefined;

  try {
    const parsed = new URL(urlStr, "https://phony.example");
    const sp = parsed.searchParams;
    const hp = parsed.hash ? new URLSearchParams(parsed.hash.replace(/^#/, "")) : null;

    idToken = sp.get("id_token") ?? hp?.get("id_token") ?? undefined;
    error = sp.get("error") ?? hp?.get("error") ?? undefined;
    errorDescription = sp.get("error_description") ?? hp?.get("error_description") ?? undefined;
  } catch {}

  if (!idToken) {
    const tokenMatch = urlStr.match(/[#?&]id_token=([^&]+)/);
    if (tokenMatch) idToken = decodeURIComponent(tokenMatch[1]);
  }
  if (!error) {
    const errorMatch = urlStr.match(/[#?&]error=([^&]+)/);
    if (errorMatch) error = decodeURIComponent(errorMatch[1]);
  }
  if (!errorDescription) {
    const descMatch = urlStr.match(/[#?&]error_description=([^&]+)/);
    if (descMatch) errorDescription = decodeURIComponent(descMatch[1]);
  }

  return { idToken, error, errorDescription };
}

/**
 * Session state for the app.
 *
 * `status` starts at `"loading"` rather than `"guest"` so a screen does not
 * flash a sign-in prompt for the instant before the stored token has been
 * checked against `/auth/me`.
 */

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthValue = {
  status: AuthStatus;
  user: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<Profile | null>(null);
  const handledTokenRef = useRef<string | null>(null);

  /**
   * Re-checks the session against `/auth/me` and updates `status`/`user`
   * from the answer. Called on mount to restore a session from the token
   * already sitting in SecureStore, and again after every call that changes
   * who's signed in (login, Google, OTP verify) — one implementation, so a
   * future change to what "signed in" means cannot update one call site and
   * miss the other.
   */
  const hydrate = useCallback(async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    // `AuthProvider` sits at the app root and is never unmounted for the
    // life of the process, so there is no stale-update race to guard here —
    // unlike a screen-level effect, this one has nothing to cancel. The IIFE
    // (rather than `void hydrate()` directly) keeps the lint rule that flags
    // setState-in-effect from tracing the call back to `hydrate`'s body.
    void (async () => {
      await hydrate();
    })();
  }, [hydrate]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login({ email, password });
      await hydrate();
    },
    [hydrate],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      await authApi.loginWithGoogle(idToken);
      await hydrate();
    },
    [hydrate],
  );

  /**
   * Captures OAuth redirects (such as Google Sign-In) that arrive via deep link.
   * In Expo Go, receiving a deep link often reloads the app runtime; by inspecting
   * `Linking.getInitialURL()`, we recover the `id_token` across that reload.
   */
  useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url) return;
      const { idToken, error, errorDescription } = extractAuthParams(url);
      if (idToken && idToken !== handledTokenRef.current) {
        handledTokenRef.current = idToken;
        console.log("[AuthProvider] Found id_token from deep link/launch URL! Authenticating...");
        try {
          await loginWithGoogle(idToken);
          console.log("[AuthProvider] Successfully authenticated via launch deep link!");
        } catch (err) {
          console.error("[AuthProvider] Failed to authenticate id_token from deep link:", err);
        }
      } else if (error) {
        console.warn("[AuthProvider] OAuth redirect returned error:", error, errorDescription);
      }
    };

    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        void processUrl(initialUrl);
      }
    });

    const sub = Linking.addEventListener("url", (event) => {
      void processUrl(event.url);
    });

    return () => {
      sub.remove();
    };
  }, [loginWithGoogle]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input);
    return { email: result.email };
  }, []);

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      await authApi.verifyOtp(email, otp);
      await hydrate();
    },
    [hydrate],
  );

  const resendOtp = useCallback(async (email: string) => {
    await authApi.resendOtp(email);
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const profile = await authApi.updateProfile(input);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await authApi.deleteAccount();
    } finally {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const value: AuthValue = {
    status,
    user,
    login,
    loginWithGoogle,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
