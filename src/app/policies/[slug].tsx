import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/lib/theme";
import { fallbackPolicies, fetchPolicy, listPolicies, POLICY_SLUGS, type Policy, type PolicySlug } from "@/lib/data/policies";
import { useSiteSettings } from "@/lib/data/catalogue-context";
import { formatDate } from "@/lib/format";
import { Page, Container } from "@/components/layout/page";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { InlineLink, Link } from "@/components/ui/link";
import { NotFound } from "@/components/layout/not-found";

export default function PolicyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { contact } = useSiteSettings();
  const known = (POLICY_SLUGS as readonly string[]).includes(slug);

  // The static fallback renders immediately; the admin-edited copy replaces it when it arrives.
  const [policy, setPolicy] = useState<Policy | undefined>(known ? fallbackPolicies[slug as PolicySlug] : undefined);
  const [policies, setPolicies] = useState<Policy[]>(POLICY_SLUGS.map((s) => fallbackPolicies[s]));

  useEffect(() => {
    if (!known) return;
    let cancelled = false;
    void (async () => {
      const [current, all] = await Promise.all([fetchPolicy(slug), listPolicies()]);
      if (cancelled) return;
      if (current) setPolicy(current);
      setPolicies(all);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, known]);

  if (!known || !policy) return <NotFound />;

  return (
    <Page>
      <Container style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Breadcrumbs trail={[{ label: policy.title }]} />

        <View style={{ marginTop: 32, gap: 32 }}>
          <View accessibilityLabel="Policies">
            <Eyebrow style={{ marginBottom: 16 }}>Policies</Eyebrow>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {policies.map((p) => {
                const active = p.slug === policy.slug;
                return (
                  <Link
                    key={p.slug}
                    href={`/policies/${p.slug}`}
                    style={{ borderWidth: 1, borderColor: active ? colors.gold : colors.line, backgroundColor: active ? colors.gold : "transparent", paddingHorizontal: 16, paddingVertical: 10 }}
                  >
                    <Eyebrow color={active ? colors.white : colors.charcoal}>{p.title}</Eyebrow>
                  </Link>
                );
              })}
              <Link href="/faq" style={{ borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, paddingVertical: 10 }}>
                <Eyebrow color={colors.charcoal}>Help & FAQ</Eyebrow>
              </Link>
            </View>
          </View>

          <View style={{ maxWidth: 672 }}>
            <Display size={36} leading="tight">
              {policy.title}
            </Display>
            <Eyebrow size={10} style={{ marginTop: 12 }}>
              Last updated {formatDate(policy.updated)}
            </Eyebrow>
            <Display size={20} leading="relaxed" style={{ marginTop: 24 }}>
              {policy.intro}
            </Display>

            <View style={{ marginTop: 48, gap: 48 }}>
              {policy.sections.map((section) => (
                <View key={section.heading}>
                  <Display size={24}>{section.heading}</Display>
                  <View style={{ marginTop: 16, gap: 16 }}>
                    {section.body.map((para, i) => (
                      <Sans key={i} size={15} leading={28} color={colors.charcoalSoft}>
                        {para}
                      </Sans>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <Sans size={12} leading="relaxed" color={colors.muted} style={{ marginTop: 64, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 24 }}>
              Questions about this policy? Write to{" "}
              <InlineLink href={contact.emailHref}>
                <Sans size={12} color={colors.goldText}>
                  {contact.email}
                </Sans>
              </InlineLink>{" "}
              or WhatsApp {contact.whatsapp}.
            </Sans>
          </View>
        </View>
      </Container>
    </Page>
  );
}
