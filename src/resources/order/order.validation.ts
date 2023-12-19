import { number, object, string, z } from "zod";

export const createOrderSchema = object({
  body: object({
    promoId: string().optional(),
    total: number(),
    transactionRef: string(),
    paymentType: z.enum(["Stripe", "Crypto"]),
    grandTotal: number(),
  }),
});

export const fetchOrderSchema = object({
  params: object({
    orderId: string(),
  }),
});

export const fetchOrdersSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    paymentType: z.enum(["Stripe", "Crypto"]).optional(),
    hasPromoCode: z.enum(["true", "false"]).optional(),
  }),
});
