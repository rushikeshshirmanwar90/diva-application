import { View } from "react-native";
import { ProductGridSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/page";

/** Loading shape for every catalogue-style route — shop, category, search and a single collection. */
export function CatalogueSkeleton() {
  return (
    <SkeletonGroup label="Loading jewellery">
      <Container style={{ marginBottom: 48, paddingTop: 32 }}>
        <Skeleton style={{ height: 12, width: 160 }} />
        <Skeleton style={{ marginTop: 24, height: 10, width: 96 }} />
        <Skeleton style={{ marginTop: 12, height: 36, width: 288, maxWidth: "100%" }} />
        <Skeleton style={{ marginTop: 16, height: 12, width: "100%" }} />
        <Skeleton style={{ marginTop: 8, height: 12, width: "75%" }} />
      </Container>
      <Container>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 16 }}>
          <Skeleton style={{ height: 12, width: 80 }} />
          <Skeleton style={{ height: 32, width: 176 }} />
        </View>
        <View style={{ marginTop: 40 }}>
          <ProductGridSkeleton count={8} />
        </View>
      </Container>
    </SkeletonGroup>
  );
}
