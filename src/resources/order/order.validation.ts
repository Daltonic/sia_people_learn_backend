import { number, object, string, z } from "zod";

export const createOrderSchema = object({
  body: object({
    userId: string(),
    promoCode: string().optional(),
    promoDiscount: number(),
    total: number(),
    transactionRef: string().optional(),
    paymentType: z.enum(["Stripe", "Crypto"]),
    grandTotal: number(),
  }).refine((data) => data.promoCode && data.promoDiscount, {
    message: "Promo discount must be provided for the corresponding promocode",
    path: ["promoDiscount"],
  }),
});

export const fetchOrderSchema = object({
  params: object({
    orderId: string(),
  }),
});
