import { Image } from "expo-image";
import { Link } from "@/components/ui/link";

/** Intrinsic size of diva-logo.png — the "· Est. 1998" tagline is baked into the artwork. */
const LOGO_WIDTH = 1774;
const LOGO_HEIGHT = 887;

export function Logo({ width = 120, href = "/" }: { width?: number; href?: string }) {
  return (
    <Link href={href} accessibilityLabel="Diva — The Indian Jewel, home" style={{ alignSelf: "flex-start" }}>
      <Image
        source={require("@/assets/images/diva/diva-logo.png")}
        style={{ width, height: (width * LOGO_HEIGHT) / LOGO_WIDTH }}
        contentFit="contain"
        accessibilityLabel="Diva — The Indian Jewel"
      />
    </Link>
  );
}
