# PhonePe Payment Gateway Integration

The app pays with PhonePe's native SDK, `react-native-phonepe-pg` v3 (PhonePe Standard Checkout v2). PhonePe's own payment screen opens inside the app and can hand off straight to an installed UPI app. Cash on delivery is unchanged.

## Payment flow

1. **Checkout** (`src/components/checkout/checkout-view.tsx`) creates the order with `createOrder`.
2. **Order token.** `initiatePaymentSDK(orderNumber)` calls the backend's `POST /payments/phonepe/initiate-sdk`, which creates a PhonePe SDK order (`/checkout/v2/sdk/order`). It returns `merchantId`, `orderId`, `token` and `environment`. The amount always comes from the stored order on the server.
3. **PhonePe screen.** `payWithPhonePe()` (`src/lib/phonepe.ts`) runs the SDK's `init()`, then `startTransaction()` with `{ orderId, merchantId, token, paymentMode: { type: "PAY_PAGE" } }`.
4. **Confirmation.** When PhonePe closes, the app opens `checkout/payment-return?ref=<merchantTransactionId>`. That screen polls `GET /payments/phonepe/status/:id` and goes to "Order confirmed" on `SUCCESS`.
5. **Cancelled payment.** If the SDK did not report `SUCCESS`, the URL also carries `&sdk=incomplete`. After about 10 seconds the screen then offers "Try paying again" instead of waiting a full minute.

Only the backend marks an order paid: its status check, PhonePe's webhook, or the reconciliation sweep. Nothing the phone reports settles an order.

## Native setup: `plugins/withPhonePe.js`

The library needs native setup that it doesn't include itself. The config plugin (listed in `app.json`) adds it whenever the native projects are generated:

- **Android: PhonePe's Maven repository** (`https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android`), for PhonePe's `IntentSDK` 5.3.1.
- **Android: `com.phonepepaymentsdk.PhonePeSDKIntermediateActivity`.** `startTransaction` launches this activity, but neither the library nor IntentSDK declares it. Without it, every payment fails with "Unable to find explicit activity class" before PhonePe opens. It uses the SDK's theme, `@style/phonepeThemeInvisibleCompat`.
- **iOS: the AppDelegate** posts `ApplicationOpenURLNotification` with `userInfo["openUrl"]`, as PhonePe's setup guide requires, so the SDK regains control when a UPI app returns to `diva://`.
- **iOS: `app.json`** lists `ppemerchantsdkv1`, `ppemerchantsdkv2` and `ppemerchantsdkv3` (and the UPI app schemes) in `LSApplicationQueriesSchemes`.

## Backend configuration (`diva-backend`)

These must be set in the backend's environment (Vercel for production):

- `PHONEPE_CLIENT_ID`
- `PHONEPE_CLIENT_SECRET`
- `PHONEPE_CLIENT_VERSION`
- `PHONEPE_ENV` (`SANDBOX` or `PRODUCTION`)
- `PHONEPE_MERCHANT_ID`
- `PHONEPE_WEBHOOK_USERNAME`
- `PHONEPE_WEBHOOK_PASSWORD`

`npm run check:integrations` in `diva-backend` confirms the credentials work. With `PHONEPE_ENV=PRODUCTION`, every payment is real money.

## Building

PhonePe's SDK is native code, so payments work only in an EAS build of the app (`eas build --platform android`), never in Expo Go. Rebuild after any change to native packages or to `plugins/withPhonePe.js`. For a local native build, run `npx expo prebuild --clean` first.
