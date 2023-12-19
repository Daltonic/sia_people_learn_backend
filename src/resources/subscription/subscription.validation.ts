import { number, object, string, z } from "zod";

export const createSubsciptionSchema = object({
  body: object({
    orderId: string().optional(),
    paymentFrequency: number(), // Payment frequency should be in months.
    paymentFrequencyType: z.enum(["Month", "Year"]),
    productType: z.enum(["Course", "Academy"]),
    productId: string(),
  }),
});

export const deleteSubscriptionSchema = object({
  params: object({
    subscriptionId: string(),
  }),
});
