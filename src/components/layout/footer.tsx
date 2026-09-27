import { View } from "react-native";
import { Mail, Phone } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useCategories, useSiteSettings } from "@/lib/data/catalogue-context";
import { occasionCollections } from "@/lib/data/occasions";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

export function Footer() {
  const categoryList = useCategories();
  const settings = useSiteSettings();
  const contact = settings.contact;

  return (
    <View style={{ marginTop: 96, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.beige }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 64, gap: 48 }}>
        <View>
          <Display size={24} tracking={0.4}>
            {settings.storeName || "DIVA"}
          </Display>
          <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 16, maxWidth: 384 }}>
            {settings.footerBlurb}
          </Sans>
          <View style={{ marginTop: 28, flexDirection: "row", gap: 12 }}>
            {[InstagramIcon, FacebookIcon, YoutubeIcon].map((Icon, i) => (
              <View
                key={i}
                style={{ width: 36, height: 36, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={15} color={colors.charcoal} />
              </View>
            ))}
          </View>
        </View>

        <FooterColumn
          heading="Shop"
          links={[
            ...categoryList.slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
            { label: "Shop all", href: "/shop" },
          ]}
        />

        <FooterColumn
          heading="Collections"
          links={occasionCollections.map((c) => ({ label: c.name, href: `/collections/${c.slug}` }))}
        />

        <View>
          <Eyebrow style={{ marginBottom: 16 }}>Help</Eyebrow>
          <View style={{ gap: 10 }}>
            {settings.helpLinks.map((l) => (
              <Link key={`${l.href}-${l.label}`} href={l.href} style={{ alignSelf: "flex-start" }}>
                <Sans size={14} color={colors.charcoal}>
                  {l.label}
                </Sans>
              </Link>
            ))}
          </View>

          <View style={{ marginTop: 28, gap: 8 }}>
            <Link href={contact.phoneHref} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Phone size={13} color={colors.gold} />
              <Sans size={12} color={colors.muted}>
                {contact.phone}
              </Sans>
            </Link>
            <Link href={contact.emailHref} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Mail size={13} color={colors.gold} />
              <Sans size={12} color={colors.muted}>
                {contact.email}
              </Sans>
            </Link>
            <Sans size={12} color={colors.muted}>
              {contact.addressLine}
            </Sans>
          </View>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: "rgba(230,224,215,0.7)", paddingHorizontal: 20, paddingVertical: 24, gap: 12 }}>
        <Sans size={10} color={colors.muted} tracking={0.025}>
          {settings.copyrightText}
        </Sans>
        <Eyebrow size={10}>{settings.paymentMethodsNote}</Eyebrow>
      </View>
    </View>
  );
}

function FooterColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <View>
      <Eyebrow style={{ marginBottom: 16 }}>{heading}</Eyebrow>
      <View style={{ gap: 10 }}>
        {links.map((l) => (
          <Link key={l.href + l.label} href={l.href} style={{ alignSelf: "flex-start" }}>
            <Sans size={14} color={colors.charcoal}>
              {l.label}
            </Sans>
          </Link>
        ))}
      </View>
    </View>
  );
}
