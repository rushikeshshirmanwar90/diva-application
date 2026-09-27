/**
 * App configuration — edited directly, not read from a `.env` file.
 *
 * A plain module, not `process.env.EXPO_PUBLIC_*`: Metro only inlines
 * `EXPO_PUBLIC_*` vars at the moment `expo start` boots, so a `.env` edit
 * needed the dev server restarted (`expo start -c`) before it took effect,
 * which looked like the change had silently done nothing. Editing the values
 * below is a normal source change — save the file and Fast Refresh picks it
 * up like any other edit, no restart, no cache clear.
 *
 * None of this is secret. It ships inside the app bundle either way — as a
 * `.env` value it was inlined into the JS at build time and readable by
 * anyone who unpacks the app, exactly as it is written here in plain sight.
 * Nothing that needs to stay private (API secrets, signing keys) belongs on
 * a mobile client at all; those live only in `diva-backend`.
 */

// -----------------------------------------------------------------------
// Backend origin
// -----------------------------------------------------------------------

/**
 * The backend the app talks to directly — no BFF proxy on mobile (see
 * `src/lib/api/client.ts`).
 *
 * For local development against a backend running on this machine:
 *   1. `cd diva-backend && npx next dev -p 4000`
 *   2. Find this Mac's LAN IP: `ipconfig getifaddr en0` (it can change
 *      between networks — recheck if the app suddenly can't connect)
 *   3. Swap the line below for: `export const API_ORIGIN = "http://<that-ip>:4000";`
 *   4. Your phone or simulator must be on the same Wi-Fi to reach it
 *
 * Put it back to the line below before a real build (EAS / TestFlight /
 * Play) — a build shipped pointed at a LAN IP only works on your own network.
 */
export const API_ORIGIN = "https://diva-backend.vercel.app";

// -----------------------------------------------------------------------
// Google sign-in
// -----------------------------------------------------------------------

/**
 * All three ids below come from the same Google Cloud project (APIs &
 * Services → Credentials).
 *
 *   Web client     — set; also the backend's `GOOGLE_CLIENT_ID`.
 *   Android client — type "Android", package `com.diva.jewel`, with the
 *                    SHA-1 of the keystore that signs the build you're
 *                    testing:
 *                      debug   7C:F7:DD:A4:BB:D0:0F:42:4C:50:34:1A:02:CB:0F:6A:28:DB:E5:29
 *                      release run `eas credentials` (or keytool on your
 *                              upload key)
 *                    Add a second Android client for a release SHA-1 — both
 *                    can coexist. In the client's Advanced settings, turn on
 *                    "Custom URI scheme".
 *   iOS client     — type "iOS", bundle id `com.diva.jewel`.
 *
 * Paste the Android and iOS ids into the backend's `GOOGLE_MOBILE_CLIENT_IDS`
 * (comma-separated) so it accepts tokens issued to them. Native client ids
 * only work in a development build (`npx expo run:android` /
 * `eas build --profile development`) — never in Expo Go.
 *
 * Leave `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` as `undefined`
 * until provisioned; `SocialButtons` (`components/auth/google-button.tsx`)
 * shows an explanatory toast instead of a broken button on a platform with
 * no id yet, rather than hiding the control outright.
 */

export const GOOGLE_WEB_CLIENT_ID = "192134530774-sd8gmcifhtiu88r08pt4huih7svfcvtm.apps.googleusercontent.com";
export const GOOGLE_IOS_CLIENT_ID = "192134530774-tlvmd4tnmmq4adv4sen7bjmf6a3no0n5.apps.googleusercontent.com";
export const GOOGLE_ANDROID_CLIENT_ID = "192134530774-ri3iq7r80o0dbsv6l0ts61blufnrkaom.apps.googleusercontent.com";
