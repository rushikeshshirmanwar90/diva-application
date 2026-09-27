import { View } from "react-native";
import { Image } from "expo-image";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { blogPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { Page, Container } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

export default function BlogScreen() {
  const [lead, ...rest] = blogPosts;

  return (
    <Page>
      <PageHeader
        eyebrow="The Journal"
        title="Know what you're buying"
        description="Written by the people who make the pieces. No trend pieces, no filler."
        trail={[{ label: "Journal" }]}
      />

      <Container style={{ paddingBottom: 80 }}>
        {lead ? (
          <Link href={`/blog/${lead.slug}`} style={{ gap: 40 }}>
            <View style={{ aspectRatio: 16 / 11, backgroundColor: colors.beige, overflow: "hidden" }}>
              <Image source={{ uri: lead.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
            <View>
              <Eyebrow>
                Latest · {lead.tag} · {lead.readMinutes} min read
              </Eyebrow>
              <Display size={30} leading="tight" style={{ marginTop: 16 }}>
                {lead.title}
              </Display>
              <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 20, maxWidth: 512 }}>
                {lead.excerpt}
              </Sans>
              <View style={{ marginTop: 28, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Eyebrow color={colors.charcoal}>Read the article</Eyebrow>
                <ArrowRight size={14} color={colors.charcoal} />
              </View>
              <Sans size={10} color={colors.muted} tracking={0.025} style={{ marginTop: 16 }}>
                {lead.author} · {formatDate(lead.publishedAt)}
              </Sans>
            </View>
          </Link>
        ) : null}

        <View style={{ marginTop: 80, gap: 48 }}>
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <View style={{ aspectRatio: 16 / 11, backgroundColor: colors.beige, overflow: "hidden" }}>
                <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </View>
              <Eyebrow style={{ marginTop: 20 }}>
                {post.tag} · {post.readMinutes} min read
              </Eyebrow>
              <Display size={24} leading="snug" style={{ marginTop: 8 }}>
                {post.title}
              </Display>
              <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 8 }}>
                {post.excerpt}
              </Sans>
              <Sans size={10} color={colors.muted} tracking={0.025} style={{ marginTop: 12 }}>
                {formatDate(post.publishedAt)}
              </Sans>
            </Link>
          ))}
        </View>
      </Container>
    </Page>
  );
}
