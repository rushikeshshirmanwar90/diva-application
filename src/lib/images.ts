/**
 * Demo imagery — the same Unsplash ids the site uses for editorial sections,
 * fallbacks and the auth panels.
 */

const photo = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Product-still photography. */
export const STILL = {
  solitaireRing: photo("photo-1605100804763-247f67b3557e"),
  sapphireRing: photo("photo-1603561591411-07134e71a2a9"),
  goldRingTrio: photo("photo-1543294001-f7cd5d7fb516"),
  gemstoneFlowerRing: photo("photo-1602173574767-37ac01994b2a"),
  gemstoneRings: photo("photo-1608042314453-ae338d80c427"),
  roseGoldRings: photo("photo-1631982690223-8aa4be0a2497"),
  ringInBox: photo("photo-1512163143273-bde0e3cc7407"),
  goldRingsOnStone: photo("photo-1617038260897-41a1f14a8ca0"),

  chandelierEarrings: photo("photo-1535632066927-ab7c9ab60908"),
  hoopsOnBox: photo("photo-1584302179602-e4c3d3fd629d"),
  hoopsOnDish: photo("photo-1608508644127-ba99d7732fee"),
  hoopsOnStone: photo("photo-1617038220319-276d3cfab638"),
  diamondStuds: photo("photo-1626784215021-2e39ccf971cd"),

  templeSet: photo("photo-1601121141461-9d6647bca1ed"),
  bridalNecklace: photo("photo-1618403088890-3d9ff6f4c8b1"),
  chunkyChain: photo("photo-1602751584552-8ba73aad10e1"),
  hangingPendants: photo("photo-1506630448388-4e683c67ddb0"),
  diamondPendant: photo("photo-1589128777073-263566ae5e4d"),
  tealPendant: photo("photo-1599643477877-530eb83abc8e"),
  crescentPendants: photo("photo-1599643478518-a784e5dc4c8f"),
  pearlNecklace: photo("photo-1515562141207-7a88fb7ce338"),

  tennisBracelet: photo("photo-1573408301185-9146fe634ad0"),
  roseGoldBangle: photo("photo-1611591437281-460bfbe1220a"),
} as const;

/** On-model / lifestyle photography for banners, editorial and the feed. */
export const MODEL = {
  layeredOlive: photo("photo-1599459183200-59c7687a0275", 1600),
  layeredNecklaces: photo("photo-1531995811006-35cb42e1a022", 1400),
  daintyWhite: photo("photo-1600721391689-2564bb8055de", 1400),
  layeredPendants: photo("photo-1610694955371-d4a3e0ce4b52", 1400),
  coinPendant: photo("photo-1611085583191-a3b181a88401", 1400),
  pearlShirt: photo("photo-1611652022419-a9419f74343d", 1400),
  ringAndPendant: photo("photo-1620656798579-1984d9e87df7", 1400),
  chokerPortrait: photo("photo-1621784563330-caee0b138a00", 1400),
  braceletWrist: photo("photo-1596944924616-7b38e7cfac36", 1400),
} as const;

export function isAnimatedImageUrl(url: string): boolean {
  return /\.gif($|\?)/i.test(url);
}

/**
 * Asks the CDN for an image no wider than `width` px, in the best format the
 * device accepts.
 *
 * Uploads are stored as the raw Cloudinary `secure_url` — the original file,
 * often 3000px+ and several MB. Decoding eight of those to draw 180dp cards is
 * what makes the grid stutter and the first paint slow. Cloudinary resizes on
 * the fly from a transformation segment in the path; Unsplash takes `w=`.
 * Anything else is returned untouched. GIFs are left alone so they keep
 * animating.
 */
export function cdnImage(url: string, width: number): string {
  if (!url || isAnimatedImageUrl(url)) return url;

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Already transformed (e.g. `/upload/w_1200,.../v123/`): swap the width
    // rather than leave it. The catalogue mapper sizes gallery images to
    // `IMG.full` once; a card or thumbnail drawing the same image must still
    // be able to ask for its own, smaller, size — otherwise every 180dp card
    // in a grid decodes the 1200px gallery file.
    if (/\/upload\/[a-z]+_[^/]+\//.test(url)) {
      return url.replace(/(\/upload\/)[^/]*\//, `$1w_${width},c_limit,f_auto,q_auto/`);
    }
    return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
  }

  if (url.includes("images.unsplash.com")) {
    return url.replace(/([?&])w=\d+/, `$1w=${width}`);
  }

  return url;
}

/** Widths for the sizes the app actually draws at, ×2–3 for device pixel ratio. */
export const IMG = {
  /** Gallery thumbnails, 80dp. */
  icon: 240,
  /** Product cards, cart / search thumbnails. */
  thumb: 600,
  /** Full-width banners, the gallery, category and collection heroes. */
  full: 1200,
} as const;
