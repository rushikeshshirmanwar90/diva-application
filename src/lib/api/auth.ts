import { apiFetch, backendUrl } from "@/lib/api/client";
import { clearTokens, getTokens, setTokens } from "@/lib/auth/token-store";

/**
 * Auth calls. On mobile the backend answers sign-in with the tokens in the
 * body; this module stores them and hands back only the user, so nothing
 * above it ever handles a token.
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatarUrl?: string;
};

export type Profile = SessionUser & {
  phone?: string;
  marketingOptIn: boolean;
  createdAt: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  marketingOptIn?: boolean;
};

export type RegisterResult = { requiresVerification: true; email: string };

export type LoginInput = { email: string; password: string };

export type UpdateProfileInput = {
  name?: string;
  phone?: string;
  marketingOptIn?: boolean;
};

type Session = { user: SessionUser; accessToken: string; refreshToken: string };

async function establish(session: Session): Promise<{ user: SessionUser }> {
  await setTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
  return { user: session.user };
}

export function register(input: RegisterInput) {
  return apiFetch<RegisterResult>("/auth/register", { method: "POST", body: input });
}

export async function verifyOtp(email: string, otp: string) {
  const session = await apiFetch<Session>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
  return establish(session);
}

export function resendOtp(email: string) {
  return apiFetch<{ sent: true }>("/auth/resend-otp", { method: "POST", body: { email } });
}

export async function login(input: LoginInput) {
  const session = await apiFetch<Session>("/auth/login", {
    method: "POST",
    body: { ...input, audience: "storefront" },
  });
  return establish(session);
}

/** `idToken` is the credential Google hands the app. */
export async function loginWithGoogle(idToken: string) {
  const session = await apiFetch<Session>("/auth/google", {
    method: "POST",
    body: { idToken, audience: "storefront" },
  });
  return establish(session);
}

/** Always "sent", whether or not the address exists — see the backend's note. */
export function forgotPassword(email: string) {
  return apiFetch<{ sent: true }>("/auth/forgot-password", { method: "POST", body: { email } });
}

export async function logout() {
  const tokens = await getTokens();
  try {
    if (tokens) {
      // The backend reads the refresh token from this header for non-cookie clients.
      await fetch(backendUrl("/auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "X-Refresh-Token": tokens.refreshToken,
          "X-Client": "mobile",
        },
      });
    }
  } finally {
    await clearTokens();
  }
  return { loggedOut: true as const };
}

/** Whoami — a 401 here just means "signed out". */
export async function getMe() {
  if (!(await getTokens())) throw new Error("Signed out");
  return apiFetch<Profile>("/auth/me");
}

export function updateProfile(input: UpdateProfileInput) {
  return apiFetch<Profile>("/auth/me", { method: "PATCH", body: input });
}

export async function deleteAccount() {
  const tokens = await getTokens();
  try {
    if (tokens) {
      await fetch(backendUrl("/auth/delete-account"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "X-Refresh-Token": tokens.refreshToken,
          "X-Client": "mobile",
        },
      });
    }
  } finally {
    await clearTokens();
  }
  return { deleted: true as const };
}
