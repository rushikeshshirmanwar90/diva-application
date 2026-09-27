import { apiFetch, apiFetchWithMeta } from "@/lib/api/client";

/** A customer's own submitted review, any moderation status. */
export type MyReview = {
  _id: string;
  productId: { _id: string; title: string; slug: string; images: { url: string }[] };
  rating: number;
  title?: string;
  body?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reply?: { body: string; repliedAt: string } | null;
  createdAt: string;
};

export type MyReviewsPage = {
  items: MyReview[];
  total: number;
};

export async function listMyReviews(page = 1, limit = 20): Promise<MyReviewsPage> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  const { data, meta } = await apiFetchWithMeta<MyReview[]>(`/reviews/mine?${query}`);

  return { items: data, total: (meta.total as number) ?? data.length };
}

export type SubmitReviewInput = {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
};

/**
 * Also how an edit works: the backend upserts on `(productId, userId)`, so
 * submitting again for the same product replaces the previous review rather
 * than creating a second one — and resets it to PENDING, since the edited
 * text hasn't been moderated yet.
 */
export function submitReview(input: SubmitReviewInput) {
  return apiFetch<{ status: string }>("/reviews", { method: "POST", body: input });
}

export function deleteReview(id: string) {
  return apiFetch<{ deleted: true }>(`/reviews/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
