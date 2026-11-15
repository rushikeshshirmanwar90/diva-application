import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/link";

/** The studio credit that closes every screen; the name opens the studio's site. */
export function DeveloperCredit() {
  return (
    <Sans size={10} leading="relaxed" color="rgba(122,115,108,0.8)" align="center">
      Developed by{" "}
      <InlineLink href="https://exponentor.com/">
        <Sans size={10} color={colors.goldText}>
          Exponentor
        </Sans>
      </InlineLink>
    </Sans>
  );
}
