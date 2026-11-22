const { withAppDelegate, withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Native setup for `react-native-phonepe-pg` (PhonePe Standard Checkout SDK).
 *
 * Android
 *   - PhonePe's Maven repository, where the IntentSDK dependency lives.
 *
 *   No manifest changes. The library's own manifest (`AndroidManifestNew.xml`,
 *   the one AGP 7.3+ reads) already declares `PhonePeSDKIntermediateActivity`,
 *   and IntentSDK 5.3.1 declares its payment activity and the `<queries>` for
 *   UPI apps. Declaring the intermediate activity again here, with a different
 *   theme, is a manifest-merger conflict that fails the Gradle build.
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
const NOTIFICATION = "ApplicationOpenURLNotification";

function addMavenRepo(contents) {
  if (contents.includes("phonepe.mycloudrepo.io")) return contents;
  const mavenRepo = `maven { url "${MAVEN_URL}" }`;
  if (/allprojects\s*\{\s*repositories\s*\{/.test(contents)) {
    return contents.replace(/allprojects\s*\{\s*repositories\s*\{/, `allprojects {\n        repositories {\n            ${mavenRepo}`);
  }
  return contents.replace(/repositories\s*\{/, `repositories {\n        ${mavenRepo}`);
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
module.exports.addOpenUrlNotification = addOpenUrlNotification;
