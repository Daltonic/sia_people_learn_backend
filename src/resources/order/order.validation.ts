import { number, object, string, z } from "zod";

export const createOrderSchema = object({
  body: object({
    promoId: string().optional(),
    total: number({ required_error: "Order total is required" }),
    transactionRef: string({
      required_error: "Transaction reference is required",
    }),
    paymentType: z.enum(["Stripe", "Crypto"]),
    grandTotal: number({ required_error: "Order grand total is required." }),
  }),
});

export const fetchOrderSchema = object({
  params: object({
    orderId: string({ required_error: "Order ID is required" }),
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
