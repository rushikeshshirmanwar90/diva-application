import { Linking, Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { colors } from "@/lib/theme";

/**
 * The origin the embed is served from on native.
 *
 * YouTube's player refuses to play inside a document with no origin — it
 * shows the "Video unavailable · Watch on YouTube" card (error 153) instead.
 * A `WebView` pointed straight at the embed URL is exactly that: no parent
 * document, no `Referer`. Loading a one-line HTML page with a real `baseUrl`
 * gives the iframe an origin, the request a referrer, and the player its
 * permission — the same trick `react-native-youtube-iframe` relies on.
 */
const EMBED_ORIGIN = "https://www.divatheindianjewel.com";

function buildSrc(embedUrl: string, autoplay: boolean, native: boolean): string {
  // The privacy-enhanced host is fine in a browser, but on native the plain
  // host is the one YouTube reliably lets a WebView play from.
  const base = native ? embedUrl.replace("www.youtube-nocookie.com", "www.youtube.com") : embedUrl;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(native ? { enablejsapi: "1", origin: EMBED_ORIGIN } : {}),
  });
  return `${base}?${params.toString()}`;
}

function buildHtml(src: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: ${colors.charcoal}; overflow: hidden; }
    iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe
    src="${src}"
    title="${title.replace(/"/g, "&quot;")}"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</body>
</html>`;
}

/** A YouTube embed. Native wraps the iframe in a WebView with an origin; the web target renders the iframe itself. */
export function VideoEmbed({ embedUrl, title, autoplay = false }: { embedUrl: string; title: string; autoplay?: boolean }) {
  if (Platform.OS === "web") {
    const src = buildSrc(embedUrl, autoplay, false);
    return <iframe src={src} title={title} style={{ width: "100%", height: "100%", border: 0 }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />;
  }

  const src = buildSrc(embedUrl, autoplay, true);

  // The player's own chrome — the logo, the title, "Share" — links out to
  // youtube.com. Let those open in the YouTube app or browser rather than
  // navigating the embed frame away to a page that no longer fits it.
  const onShouldStartLoadWithRequest = (request: ShouldStartLoadRequest) => {
    // Only iOS reports sub-frame loads; the iframe itself is one, so it must pass.
    if (request.isTopFrame === false) return true;
    const { url } = request;
    if (url === "about:blank" || url.startsWith(EMBED_ORIGIN)) return true;
    void Linking.openURL(url);
    return false;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
      <WebView
        source={{ html: buildHtml(src, title), baseUrl: EMBED_ORIGIN }}
        originWhitelist={["*"]}
        style={{ flex: 1, backgroundColor: colors.charcoal }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={!autoplay}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        scrollEnabled={false}
        bounces={false}
        accessibilityLabel={title}
      />
    </View>
  );
}
