# Diva — The Indian Jewel (mobile app)

The Expo / React Native port of `diva-frontend`. Same catalogue, same copy, same
design system — Cormorant Garamond + Jost, the gold/charcoal/beige palette,
tracked uppercase eyebrows, square corners — laid out as the site renders at
its mobile breakpoint: marquee announcement bar and header pinned on top,
hamburger drawer, slide-in bag, full-screen search, footer at the end of every
page.

## Run it

```sh
npm install
npx expo start          # then press i (iOS simulator), a (Android) or w (web)
```

Fonts are bundled through the `expo-font` config plugin (see `app.json`) and
also loaded at runtime in `src/app/_layout.tsx`, so both Expo Go and a dev
build render the brand typefaces.

## How it talks to the backend

There is no BFF proxy here. The app calls `diva-backend` directly
(`API_ORIGIN` in `src/lib/config.ts` — a plain source file, not a `.env`; see
that file for how to point it at a local backend) using the backend's mobile
mode:

- `X-Client: mobile` on every request → sign-in answers with tokens in the
  body instead of setting cookies (`lib/auth/deliver-session.ts` in the backend).
- Tokens live in the Keychain / Keystore via `expo-secure-store`
  (`src/lib/auth/token-store.ts`) and go out as `Authorization: Bearer`.
- Bearer requests are exempt from the backend's CSRF check, so no CSRF token
  is needed. A 401 triggers one deduplicated refresh and a replay
  (`src/lib/api/client.ts`), exactly like the site's client.

On `expo start --web` the browser is subject to the backend's CORS allowlist;
native builds are not.

## Payments

Checkout creates the order and initiates PhonePe like the site does, then the
`checkout/payment-return` screen opens the gateway in an in-app browser and
polls `/payments/phonepe/status/:id` until it settles. COD orders confirm
in-app without leaving.

## Google sign-in

`expo-auth-session`'s Google provider produces the same id token the site's
GIS button does. The web client id has a public default; set
`GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` in `src/lib/config.ts`
(created in Google Cloud for `com.diva.jewel`) before shipping.

## Layout

```
src/app/            expo-router screens — one per site route
src/components/     layout / ui / home / product / shop / cart / checkout / auth / account
src/lib/theme.ts    the design tokens, ported from the site's globals.css
src/lib/api/        backend calls (client, auth, catalogue, checkout, …)
src/lib/data/       catalogue context, site settings, policies, editorial content
src/lib/store/      cart / wishlist / recently-viewed / coupon, persisted on device
```
