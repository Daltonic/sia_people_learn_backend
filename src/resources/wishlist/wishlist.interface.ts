import { TypeOf } from "zod";
import {
  createWishlistSchema,
  deleteWishlistSchema,
  fetchWishlistSchema,
} from "@/resources/wishlist/wishlist.validation";

export type CreateWishlistInterface = TypeOf<
  typeof createWishlistSchema
>["body"];
export type DeleteWishlistInterface = TypeOf<
  typeof deleteWishlistSchema
>["params"];
export type FetchWishtListsInterface = TypeOf<
  typeof fetchWishlistSchema
>["query"];
