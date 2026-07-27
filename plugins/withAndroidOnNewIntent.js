const { withMainActivity } = require("@expo/config-plugins");

// React Native's ReactActivity.onNewIntent already forwards to the delegate (and
// so to expo-linking's listener), but only if MainActivity overrides onNewIntent
// and calls setIntent(intent) — otherwise a warm-started app never picks up a new
// deep link, it just stays on whatever screen was already showing.
function withAndroidOnNewIntent(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes("onNewIntent")) {
      return config;
    }

    if (!contents.includes("import android.content.Intent")) {
      contents = contents.replace(
        /(import android\.os\.Bundle\n)/,
        `$1import android.content.Intent\n`
      );
    }

    contents = contents.replace(
      /(override fun getMainComponentName\(\): String = "main"\n)/,
      `$1
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
  }
`
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withAndroidOnNewIntent;
