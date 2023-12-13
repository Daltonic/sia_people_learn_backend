import { object, string, z } from "zod";

export const createWishlistSchema = object({
  body: object({
    productType: z.enum(["Course", "Academy"]),
    productId: string(),
  }),
});

export const deleteWishlistSchema = object({
  params: object({
    wishlistId: string(),
  }),
});
