import { View } from "react-native";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
import { Eyebrow, Sans } from "@/components/ui/text";

function parseLines(raw?: string, fallback: string[] = []): string[] {
  if (!raw || !raw.trim()) return fallback;
  const lines = raw
    .split("\n")
    .map((line) => line.trim().replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""))
    .filter(Boolean);
  return lines.length > 0 ? lines : fallback;
}

const DEFAULT_SHIPPING_LINES = [
  "Insured, fully tracked delivery in 2–4 working days for in-stock pieces. Made-to-order and bridal work takes 6–8 weeks from design freeze.",
  "Returns accepted within 15 days of delivery with the hallmark tag unbroken. Refunds are credited within 5 working days of receipt.",
  "One free size exchange within 30 days, including two-way courier.",
  "Photo ID matching the order name is required at delivery.",
];

function Lines({ lines }: { lines: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {lines.map((line, idx) => (
        <Sans key={idx} size={14} leading="relaxed" color={colors.muted}>
          {line}
        </Sans>
      ))}
    </View>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const a = product.attributes;

  const defaultCareLines = [
    "Perfume and hairspray first, jewellery second — with a gap.",
    "Store each piece in its own pouch. Uncut stones scratch polished gold.",
    a.stone === "Uncut Polki" || a.stone === "Pearl"
      ? "Never use an ultrasonic cleaner on this piece — polki foil and pearl nacre are both destroyed by it. Dry brush only."
      : "Free ultrasonic cleaning and re-polishing for life at any Diva counter.",
  ];

  const shippingLines = parseLines(product.shippingReturns, DEFAULT_SHIPPING_LINES);
  const careLines = parseLines(product.careInstructions, defaultCareLines);

  const specs = (
    [
      ["Finish", a.metal],
      ["Purity", a.purity],
      ["Gross weight", a.grossWeight],
      ["Stone", a.stone === "None" ? "No stone" : a.stone],
      ["Stone detail", a.stoneWeight],
      ["Wearer", a.gender],
      ["Occasion", a.occasions.join(", ")],
      ["Hallmark", a.huid],
      ["Certification", a.certification],
      ["Country of origin", "India"],
    ] as [string, string | undefined][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <Accordion
      defaultOpenFirst
      items={[
        { q: "Description", a: product.description },
        {
          q: "Specifications",
          a: (
            <View style={{ gap: 12 }}>
              {specs.map(([k, v]) => (
                <View
                  key={k}
                  style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, borderBottomWidth: 1, borderBottomColor: "rgba(230,224,215,0.7)", paddingBottom: 8 }}
                >
                  <Eyebrow size={10}>{k}</Eyebrow>
                  <Sans size={14} align="right" style={{ flexShrink: 1 }}>
                    {v}
                  </Sans>
                </View>
              ))}
            </View>
          ),
        },
        { q: "Shipping & returns", a: <Lines lines={shippingLines} /> },
        { q: "Care instructions", a: <Lines lines={careLines} /> },
      ]}
    />
  );
}
