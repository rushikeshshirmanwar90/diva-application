import { View } from "react-native";
import { colors } from "@/lib/theme";
import { useSiteSettings } from "@/lib/data/catalogue-context";
import { Page, Container } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { Accordion } from "@/components/ui/accordion";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

/** Everything here is managed in the admin console under Settings → Help & FAQ Content. */
export default function FaqScreen() {
  const settings = useSiteSettings();
  const contact = settings.contact;
  const help = settings.helpPage;

  const description = help.description.replace(/WhatsApp us(?! on)/i, `WhatsApp us on ${contact.whatsapp}`);

  return (
    <Page>
      <PageHeader eyebrow={help.eyebrow} title={help.title} description={description} trail={[{ label: "Help & FAQ" }]} />

      <Container style={{ paddingBottom: 80 }}>
        <View style={{ gap: 64 }}>
          {settings.faqs.map((group) => (
            <View key={group.group}>
              <Display size={24} style={{ marginBottom: 24 }}>
                {group.group}
              </Display>
              <Accordion items={group.items.map((i) => ({ q: i.q, a: i.a }))} />
            </View>
          ))}
        </View>

        {help.cards.length > 0 ? (
          <View style={{ marginTop: 64, gap: 24 }}>
            {help.cards.map((c, index) => (
              <Link key={`${c.href}-${index}`} href={c.href} style={{ borderWidth: 1, borderColor: colors.line, padding: 32 }} pressedStyle={{ borderColor: colors.gold }}>
                <Display size={24}>{c.title}</Display>
                <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 12 }}>
                  {c.body}
                </Sans>
                <Eyebrow color={colors.charcoal} style={{ marginTop: 20 }}>
                  {c.cta} →
                </Eyebrow>
              </Link>
            ))}
          </View>
        ) : null}
      </Container>
    </Page>
  );
}
