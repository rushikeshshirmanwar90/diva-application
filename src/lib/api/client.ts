import { API_ORIGIN as CONFIGURED_API_ORIGIN } from "@/lib/config";
import { clearTokens, getTokens, setTokens } from "@/lib/auth/token-store";

/** The backend the app talks to — see `src/lib/config.ts` to change it. */
export const API_ORIGIN = CONFIGURED_API_ORIGIN;

export function backendUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api/v1${normalized}`;
}

export type ApiFailure = {
  code: string;
  message: string;
  details?: { path: string; message: string }[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiFailure["details"];

  constructor(status: number, failure: ApiFailure) {
    super(failure.message);
    this.name = "ApiError";
    this.status = status;
    this.code = failure.code;
    this.details = failure.details;
  }
}

type Envelope<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: ApiFailure };

type FetchInit = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the bearer header — public reads that must not 401 on a stale token. */
  anonymous?: boolean;
};

function isAuthPath(path: string): boolean {
  return (
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/logout")
  );
}

/**
 * The in-flight refresh, shared by every caller that hits a 401 at once.
 * Refresh tokens rotate, so two parallel refreshes would trip the backend's
 * token-reuse detection and revoke the whole session. Same mechanism as the
 * site's `lib/api/client.ts`.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const tokens = await getTokens();
      if (!tokens) return false;

      const response = await fetch(backendUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Client": "mobile", Accept: "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken, audience: "storefront" }),
      });

      if (!response.ok) {
        // A rejected refresh means the session genuinely ended.
        if (response.status === 401 || response.status === 403) await clearTokens();
        return false;
      }

      const payload = (await response.json()) as Envelope<{ accessToken: string; refreshToken: string }>;
      if (!payload.success) return false;

      await setTokens({ accessToken: payload.data.accessToken, refreshToken: payload.data.refreshToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function send(path: string, init: FetchInit): Promise<Response> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json", "X-Client": "mobile" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  if (!init.anonymous) {
    // Read per attempt, never hoisted: a refresh rotates the token.
    const tokens = await getTokens();
    if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return fetch(backendUrl(path), {
    method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
  });
}

async function request<T>(
  path: string,
  init: FetchInit,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  let response: Response;
  try {
    response = await send(path, init);
  } catch (cause) {
    if (init.signal?.aborted) throw cause;
    throw new ApiError(503, {
      code: "SERVICE_UNAVAILABLE",
      message: "We could not reach our servers. Please try again in a moment.",
    });
  }

  if (response.status === 401 && !isAuthPath(path) && !init.anonymous) {
    if (await refreshSession()) {
      response = await send(path, init);
    }
  }

  if (response.status === 204) return { data: undefined as T };

  try {
    const payload = (await response.json()) as Envelope<T>;
    if (!payload.success) throw new ApiError(response.status, payload.error);
    return payload;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(response.status, {
      code: "INTERNAL_ERROR",
      message: "The server sent an unreadable response. Please try again.",
    });
  }
}

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const { data } = await request<T>(path, init);
  return data;
}

export async function apiFetchWithMeta<T>(
  path: string,
  init: FetchInit = {},
): Promise<{ data: T; meta: Record<string, unknown> }> {
  const { data, meta } = await request<T>(path, init);
  return { data, meta: meta ?? {} };
}

/**
 * Public reads that must never throw — the storefront renders an empty shelf,
 * not an error screen, when the backend is unreachable.
 */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path, { anonymous: true });
  } catch {
    return null;
  }
}

/** Human-readable message from anything thrown, for rendering in the UI. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
