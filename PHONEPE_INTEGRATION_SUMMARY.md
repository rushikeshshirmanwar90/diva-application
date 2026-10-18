# PhonePe Integration & Build Troubleshooting Summary

This document summarizes the issues encountered during the build and payment processing for the Diva application, along with the root causes and exact solutions applied.

---

## Current flow: PhonePe native SDK, inside the app

Payment runs inside the app with `react-native-phonepe-pg` v3 (PhonePe Standard Checkout v2). There is no browser involved, and PhonePe can hand off straight to an installed UPI app.

1. `checkout-view.tsx`: `createOrder` → `initiatePaymentSDK(orderNumber)` (backend `POST /payments/phonepe/initiate-sdk`, which calls PhonePe's `/checkout/v2/sdk/order`) → `payWithPhonePe()` in `src/lib/phonepe.ts`, which runs `init()` then `startTransaction()` with `{ orderId, merchantId, token, paymentMode: { type: "PAY_PAGE" } }`.
2. Whatever the SDK reports, the app navigates to `/checkout/payment-return?ref=<merchantTransactionId>`, which polls `/payments/phonepe/status/:id`. If the SDK did not report `SUCCESS`, the URL also carries `&sdk=incomplete`. After about 10 s without a result, the screen then shows "Payment not completed" with "Try paying again", instead of waiting 60 s. That hint only changes the screen; it never marks the order failed.
3. Only the backend settles an order: the status check, the PhonePe webhook, or the reconciliation sweep (`settleFromGateway`).

### Native setup: `plugins/withPhonePe.js`

The library leaves out native setup that it needs. The config plugin adds it at prebuild:

- **Android, Maven repo:** PhonePe's repository, `https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android`, for `IntentSDK` 5.3.1.
- **Android, intermediate activity (the bug that stopped the SDK working):** `startTransaction` launches `com.phonepepaymentsdk.PhonePeSDKIntermediateActivity`. Neither the library's manifest nor IntentSDK's declares it, so without this every payment failed with "Unable to find explicit activity class" before PhonePe opened. The plugin declares it with `exported="false"` and the SDK's `@style/phonepeThemeInvisibleCompat` theme, which it needs because it is an AppCompat activity.
- **iOS, AppDelegate:** posts `ApplicationOpenURLNotification` with `userInfo["openUrl"]` from `application(_:open:options:)`, as PhonePe's setup guide requires, so the SDK regains control after a UPI app returns to `diva://`.
- **iOS, `app.json`:** `LSApplicationQueriesSchemes` includes `ppemerchantsdkv1/v2/v3`, plus the UPI app schemes.

The SDK only exists in a development or EAS build made after this plugin ran. Expo Go and web builds have no native module, so they fall back to PhonePe's hosted page in the phone's browser, with the backend returning that browser to the website's `/app-return`. A server without SDK credentials (`initiate-sdk` answers 503) falls back the same way.

After changing the plugin, rebuild natively. Locally, run `npx expo prebuild --clean` first; EAS regenerates the native projects itself.

---

## 1. Kotlin Compilation Failure (`react-native-phonepe-pg`)

> **No longer applies.** `react-native-phonepe-pg` v3 no longer implements `ActivityEventListener` (it uses `PhonePeSDKIntermediateActivity` instead), so it compiles on RN 0.86 without a patch. This section and section 2 are historical.

### Error Log
```text
> Task :react-native-phonepe-pg:compileReleaseKotlin FAILED
e: .../PhonePePaymentSDKModule.kt:33:1 Class 'PhonePePaymentSDKModule' is not abstract and does not implement abstract members:
fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?): Unit
fun onNewIntent(intent: Intent): Unit
```

### Root Cause
In React Native 0.74+ and modern React Native versions (such as RN 0.86 in Expo SDK 57), the `ActivityEventListener` interface defines non-nullable parameters for `Activity` and `Intent`:
- `onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?)`
- `onNewIntent(intent: Intent)`

However, the third-party package `react-native-phonepe-pg` (v2.0.2) had declared these methods with nullable parameters (`Activity?` and `Intent?`), resulting in a Kotlin compiler signature mismatch.

### Solution Applied
1. Updated `node_modules/react-native-phonepe-pg/android/src/main/java/com/phonepepaymentsdk/PhonePePaymentSDKModule.kt`:
   ```kotlin
   override fun onActivityResult(
       activity: Activity,
       requestCode: Int,
       resultCode: Int,
       data: Intent?
   ) { ... }

   override fun onNewIntent(intent: Intent) {}
   ```
2. Created a patch file at `patches/react-native-phonepe-pg+2.0.2.patch`.
3. Added `"patch-package": "^8.0.0"` and `"postinstall": "patch-package"` to `package.json` to keep this fix intact during fresh `npm install` runs.

---

## 2. `patch-package` File Parse Error

### Error Log
```text
**ERROR** Failed to apply patch for package react-native-phonepe-pg
This happened because the patch file patches\react-native-phonepe-pg+2.0.2.patch could not be parsed.
```

### Root Cause
Initial patch file header formatting and hunk line counts did not strictly match standard unified diff specifications required by `patch-package`.

### Solution Applied
1. Fixed patch formatting in `patches/react-native-phonepe-pg+2.0.2.patch` to follow standard git unified diff format.
2. Instructed running `npx patch-package react-native-phonepe-pg` after making node_modules edits to automatically generate 100% compliant `.patch` files.

---

## 3. PhonePe Payment Error: `Bad Request - Api Mapping Not Found`

### Error Screen
- **Title**: *That payment did not go through*
- **Body**: *Bad Request - Api Mapping Not Found*
- **Order Number**: *DIVA-20260930-0001*

### Root Cause
1. **Merchant Account Type**: The merchant account (`M22R4Z1Z3LM02` / `SU2609031559539437584274`) is provisioned for **PhonePe Standard Checkout v2 (OAuth API)**.
2. **Legacy v1 SDK Attempt**: On mobile builds, `checkout-view.tsx` had logic (`if (isPhonePeNativeAvailable())`) attempting to initiate payments via `initiatePaymentSDK` (the v1 legacy flow `/pg/v1/pay`).
3. PhonePe servers returned `Bad Request - Api Mapping Not Found` because legacy v1 endpoints are disabled for this v2 merchant account.
4. When `PaymentReturnView` polled payment status, the backend status check failed because v1 transactions are incompatible with v2 merchant status queries.

### Solution Applied
1. Updated `src/components/checkout/checkout-view.tsx` to initiate all payments using **PhonePe Standard Checkout v2** (`initiatePayment()`):
   ```typescript
   const payment = await initiatePayment(order.orderNumber);
   navigate(
     `/checkout/payment-return?ref=${encodeURIComponent(payment.merchantTransactionId)}&url=${encodeURIComponent(payment.redirectUrl)}`,
     "replace",
   );
   ```
2. **In-App Browser Flow** (historical; the app now pays with the native SDK, see "Current flow" above):
   - `initiatePayment()` obtains the official v2 `redirectUrl` (`https://mercury.phonepe.com/...`).
   - `PaymentReturnView` opens this URL inside an in-app browser sheet (`expo-web-browser`).
   - PhonePe's official checkout UI handles all UPI options (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Wallets.
   - Upon completing the payment, `PaymentReturnView` polls `/checkout/v2/order/{id}/status`, which successfully returns `COMPLETED`/`SUCCESS` and redirects the user to the Order Confirmed screen.

---

## Summary of Modified Files

- `src/components/checkout/checkout-view.tsx`: Updated to use PhonePe v2 Standard Checkout flow across all platforms.
- `patches/react-native-phonepe-pg+2.0.2.patch`: Patch file for Android Kotlin signatures.
- `package.json`: Added `patch-package` and `postinstall` script.
- `node_modules/react-native-phonepe-pg/.../PhonePePaymentSDKModule.kt`: Patched Kotlin signatures.
