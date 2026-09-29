const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to add PhonePe maven repository to Android project build.gradle.
 * Required for Gradle to download the PhonePe native Android SDK dependencies.
 */
function withPhonePe(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language === "groovy") {
      const mavenRepo = 'maven { url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android" }';
      if (!mod.modResults.contents.includes("phonepe.mycloudrepo.io")) {
        if (/allprojects\s*\{\s*repositories\s*\{/.test(mod.modResults.contents)) {
          mod.modResults.contents = mod.modResults.contents.replace(
            /allprojects\s*\{\s*repositories\s*\{/,
            `allprojects {\n        repositories {\n            ${mavenRepo}`,
          );
        } else {
          mod.modResults.contents = mod.modResults.contents.replace(
            /repositories\s*\{/,
            `repositories {\n        ${mavenRepo}`,
          );
        }
      }
    }
    return mod;
  });
}

module.exports = withPhonePe;
