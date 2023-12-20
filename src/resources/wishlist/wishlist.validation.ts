import { object, string, z } from "zod";

export const createWishlistSchema = object({
  body: object({
    productType: z.enum(["Course", "Academy"], {
      required_error: "Product Type is required",
    }),
    productId: string({ required_error: "Product ID is required" }),
  }),
});

export const deleteWishlistSchema = object({
  params: object({
    wishlistId: string({ required_error: "Wishlist ID is required" }),
  }),
});
