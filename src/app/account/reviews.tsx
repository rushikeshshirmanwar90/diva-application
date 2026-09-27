import { AccountShell } from "@/components/account/account-shell";
import { ReviewsView } from "@/components/account/reviews-view";

export default function MyReviewsScreen() {
  return (
    <AccountShell>
      <ReviewsView />
    </AccountShell>
  );
}
