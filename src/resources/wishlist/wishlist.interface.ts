import { TypeOf } from "zod";
import {
  createWishlistSchema,
  deleteWishlistSchema,
} from "@/resources/wishlist/wishlist.validation";

export type CreateWishlistInterface = TypeOf<
  typeof createWishlistSchema
>["body"];
export type DeleteWishlistInterface = TypeOf<
  typeof deleteWishlistSchema
>["params"];
