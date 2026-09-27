import { View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/lib/theme";
import { blogPosts, getPost } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { Page, Container } from "@/components/layout/page";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { NotFound } from "@/components/layout/not-found";

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = getPost(slug);
  if (!post) return <NotFound />;

  const more = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <Page>
      <Container style={{ paddingTop: 32, paddingBottom: 80 }}>
        <Breadcrumbs trail={[{ label: "Journal", href: "/blog" }, { label: post.title }]} />

        <View style={{ marginTop: 32 }}>
          <Eyebrow>
            {post.tag} · {post.readMinutes} min read
          </Eyebrow>
          <Display size={36} leading="tight" style={{ marginTop: 16 }}>
            {post.title}
          </Display>
          <Sans size={16} leading="relaxed" color={colors.muted} style={{ marginTop: 20 }}>
            {post.excerpt}
          </Sans>
          <Sans size={11} color={colors.muted} tracking={0.025} style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 20 }}>
            {post.author} · {formatDate(post.publishedAt)}
          </Sans>
        </View>

        <View style={{ marginTop: 40, aspectRatio: 16 / 10, backgroundColor: colors.beige, overflow: "hidden" }}>
          <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>

        <View style={{ marginTop: 48, gap: 24 }}>
          {post.body.map((para, i) =>
            i === 0 ? (
              <Display key={i} size={20} leading="relaxed">
                {para}
              </Display>
            ) : (
              <Sans key={i} size={15} leading={28} color={colors.charcoalSoft}>
                {para}
              </Sans>
            ),
          )}
        </View>

        <View style={{ marginTop: 56, backgroundColor: colors.beige, padding: 32 }}>
          <Eyebrow>One letter a month</Eyebrow>
          <Display size={24} style={{ marginTop: 12 }}>
            New pieces and gold-rate notes
          </Display>
          <NewsletterForm style={{ marginTop: 20 }} />
        </View>

        <View style={{ marginTop: 64, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 40 }}>
          <Eyebrow>Keep reading</Eyebrow>
          <View style={{ marginTop: 24, gap: 24 }}>
            {more.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                <View style={{ width: 80, height: 80, backgroundColor: colors.beige, overflow: "hidden" }}>
                  <Image source={{ uri: p.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                </View>
                <View style={{ flex: 1 }}>
                  <Display size={20}>{p.title}</Display>
                  <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                    {p.tag} · {p.readMinutes} min read
                  </Sans>
                </View>
              </Link>
            ))}
          </View>
        </View>
      </Container>
    </Page>
  );
}
