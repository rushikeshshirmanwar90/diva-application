import AsyncStorage from "@react-native-async-storage/async-storage";
import { domain } from "../../components/route/route";

export const readCart = async () => {
  const res = await fetch(`${domain}/api/carts`);

  const data = await res.json();

  return data.data;
};

export const addToCart = async (
  productId: string,
  userId: string,
  product_name: string | undefined,
  product_price: number | undefined,
  img: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${domain}/api/carts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          Product_id: productId,
          product_name,
          product_price,
          user_id: userId,
          qnt: 1,
          img,
        },
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to add item to cart: ${errorMessage}`);
    }

    console.log("Item added to cart successfully");
    return true;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return false;
  }
};

export const removeCart = async (cartId: number) => {
  const res = await fetch(`${domain}/api/carts/${cartId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return data.data;
};

export const increment = async (cartId: number, qnt: number) => {
  qnt++;

  const res = await fetch(`${domain}/api/carts/${cartId}`, {
    method: "PUT",
    body: JSON.stringify({
      qnt: qnt,
    }),
  });

  const data = await res.json();
  return data.data;
};

export const decrement = async (cartId: number, qnt: number) => {
  qnt--;

  const res = await fetch(`${domain}/api/carts/${cartId}`, {
    method: "PUT",
    body: JSON.stringify({
      qnt: qnt,
    }),
  });

  const data = await res.json();
  return data.data;
};
