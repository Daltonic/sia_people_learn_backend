import { TypeOf } from "zod";
import {
  approveReviewSchema,
  createReviewSchema,
  deleteReviewSchema,
} from "@/resources/review/review.validation";

export type CreateReviewInterface = TypeOf<typeof createReviewSchema>["body"];
export type DeleteReviewInterface = TypeOf<typeof deleteReviewSchema>["params"];
export type ApproveReviewInterface = TypeOf<
  typeof approveReviewSchema
>["params"];
