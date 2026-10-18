const { AndroidConfig, withAndroidManifest, withAppDelegate, withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Native setup for `react-native-phonepe-pg` (PhonePe Standard Checkout SDK).
 *
 * Android
 *   - PhonePe's Maven repository, where the IntentSDK dependency lives.
 *   - `PhonePeSDKIntermediateActivity`. The library starts this activity to run
 *     the payment, but neither its manifest nor the IntentSDK's declares it, so
 *     without this every `startTransaction` fails with "Unable to find explicit
 *     activity class" before PhonePe ever opens. It is an AppCompatActivity, so
 *     it takes the SDK's own translucent AppCompat theme.
 *
 * iOS
 *   - The AppDelegate forwards every opened URL to the SDK as the
 *     `ApplicationOpenURLNotification` it observes, so control comes back to the
 *     payment after a UPI app hands off to `diva://`. PhonePe's setup guide asks
 *     for exactly this; the library reads `userInfo["openUrl"]`.
 *
 * The transforms are exported so they can be checked against Expo's templates.
 */

const MAVEN_URL = "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android";
const INTERMEDIATE_ACTIVITY = "com.phonepepaymentsdk.PhonePeSDKIntermediateActivity";
const NOTIFICATION = "ApplicationOpenURLNotification";

function addMavenRepo(contents) {
  if (contents.includes("phonepe.mycloudrepo.io")) return contents;
  const mavenRepo = `maven { url "${MAVEN_URL}" }`;
  if (/allprojects\s*\{\s*repositories\s*\{/.test(contents)) {
    return contents.replace(/allprojects\s*\{\s*repositories\s*\{/, `allprojects {\n        repositories {\n            ${mavenRepo}`);
  }
  return contents.replace(/repositories\s*\{/, `repositories {\n        ${mavenRepo}`);
}

function addIntermediateActivity(manifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.activity = application.activity ?? [];
  if (!application.activity.some((activity) => activity.$["android:name"] === INTERMEDIATE_ACTIVITY)) {
    application.activity.push({
      $: {
        "android:name": INTERMEDIATE_ACTIVITY,
        "android:exported": "false",
        "android:theme": "@style/phonepeThemeInvisibleCompat",
      },
    });
  }
  return manifest;
}

const OPEN_URL_SIGNATURE =
  /(open url: URL,\s*options: \[UIApplication\.OpenURLOptionsKey\s*:\s*Any\]\s*=\s*\[:\]\s*\)\s*->\s*Bool\s*\{)/;

function addOpenUrlNotification(contents) {
  if (contents.includes(NOTIFICATION)) return contents;
  if (!OPEN_URL_SIGNATURE.test(contents)) {
    throw new Error(
      "withPhonePe: could not find `application(_:open:options:)` in AppDelegate.swift. " +
        "PhonePe on iOS needs it to post ApplicationOpenURLNotification; update plugins/withPhonePe.js for the new template.",
    );
  }
  return contents.replace(
    OPEN_URL_SIGNATURE,
    `$1\n    // react-native-phonepe-pg: hand UPI app returns back to PhonePe's SDK.\n    NotificationCenter.default.post(name: NSNotification.Name("${NOTIFICATION}"), object: nil, userInfo: ["openUrl": url, "options": options])`,
  );
}

function withPhonePe(config) {
  config = withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language === "groovy") mod.modResults.contents = addMavenRepo(mod.modResults.contents);
    return mod;
  });

  config = withAndroidManifest(config, (mod) => {
    mod.modResults = addIntermediateActivity(mod.modResults);
    return mod;
  });

  config = withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== "swift") {
      throw new Error("withPhonePe: expected a Swift AppDelegate.");
    }
    mod.modResults.contents = addOpenUrlNotification(mod.modResults.contents);
    return mod;
  });

  return config;
}

module.exports = withPhonePe;
module.exports.addMavenRepo = addMavenRepo;
module.exports.addIntermediateActivity = addIntermediateActivity;
module.exports.addOpenUrlNotification = addOpenUrlNotification;
