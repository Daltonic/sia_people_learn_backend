import { number, object, string, z } from "zod";

export const createPromoSchema = object({
  body: object({
    code: string({ required_error: "Promo code is required" }),
    percentage: number({ required_error: "Percentage must be a number" }).min(
      0
    ),
  }),
});

export const validatePromoSchema = object({
  params: object({
    promoId: string({ required_error: "Promo ID is required" }),
  }),
});

export const invalidatePromoSchema = object({
  params: object({
    promoId: string({ required_error: "Promo ID is required" }),
  }),
});

export const fetchPromosSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    filter: z.enum(["newest", "oldest"]).optional(),
    validated: z.enum(["true", "false"]).optional(),
  }),
});
