import { TypeOf } from "zod";
import {
  approveReviewSchema,
  createReviewSchema,
  deleteReviewSchema,
  fetchReviewsSchema,
} from "@/resources/review/review.validation";

export type CreateReviewInterface = TypeOf<typeof createReviewSchema>["body"];
export type DeleteReviewInterface = TypeOf<typeof deleteReviewSchema>["params"];
export type ApproveReviewInterface = TypeOf<
  typeof approveReviewSchema
>["params"];
export type FetchReviewsInterface = TypeOf<typeof fetchReviewsSchema>["query"];
