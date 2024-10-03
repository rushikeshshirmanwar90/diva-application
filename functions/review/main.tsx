import { domain } from "../../components/route/route";

export const addReview = async (
  productId: number,
  rating: number,
  description: string,
  userId: string
) => {
  const res = await fetch(`${domain}/api/reviews`, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      ratting: rating,
      Description: description,
      user_id: userId,
    }),
  });

  const data = await res.json();

  return data.data;
};

export const EditReview = async (
  rating: number,
  description: string,
  reviewId: number
) => {
  try {
    const response = await fetch(`${domain}/api/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({
        ratting: rating,
        Description: description,
      }),
    });
    const data = await response.json();
    console.log("Review Edited successfully:", data.data);
    return data.data;
  } catch (error) {
    console.error("Error editing review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId: number) => {
  const res = await fetch(`${domain}/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return data.data;
};

export const readReview = async () => {
  const res = await fetch(`${domain}/api/reviews`);

  const data = await res.json();

  return data.data;
};
