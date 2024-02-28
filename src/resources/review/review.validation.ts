import { number, object, string, z } from "zod";

export const createReviewSchema = object({
  body: object({
    productId: string(),
    productType: z.enum(["Course", "Academy"]),
    starRating: number().min(1).max(5),
    comment: string(),
  }),
});

export const deleteReviewSchema = object({
  params: object({
    reviewId: string(),
  }),
});

export const approveReviewSchema = object({
  params: object({
    reviewId: string(),
  }),
});

export const fetchReviewsSchema = object({
  query: object({
    name: string({ required_error: "Product Id is required" }),
    productType: z.enum(["Course", "Academy"], {
      required_error: "Product Type is required",
    }),
    approved: z.enum(["true", "false"]).optional(),
    page: string().optional(),
    pageSize: string().optional(),
    filter: z.enum(["oldest", "newest"]).optional(),
  }),
});
