/** YouTube link handling for product videos and shorts. */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function toYouTubeVideoId(input?: string | null): string | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return VIDEO_ID.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
    return null;
  }

  const queryId = url.searchParams.get("v");
  if (queryId && VIDEO_ID.test(queryId)) return queryId;

  const [segment, id] = url.pathname.split("/").filter(Boolean);
  if (segment && id && ["shorts", "embed", "live", "v"].includes(segment)) {
    return VIDEO_ID.test(id) ? id : null;
  }

  return null;
}

export function isYouTubeUrl(input?: string | null): boolean {
  return toYouTubeVideoId(input) !== null;
}

export function toYouTubeEmbedUrl(input?: string | null): string | null {
  const id = toYouTubeVideoId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function toYouTubeThumbnail(input?: string | null): string | null {
  const id = toYouTubeVideoId(input);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
