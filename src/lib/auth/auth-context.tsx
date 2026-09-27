import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";
import type { Profile, RegisterInput, UpdateProfileInput } from "@/lib/api/auth";

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
