import { number, object, string, z } from "zod";

export const createSubsciptionSchema = object({
  body: object({
    orderId: string().optional(),
    paymentFrequency: number({
      required_error: "Payment frequency is required (in months)",
    }), // Payment frequency should be in months.
    paymentFrequencyType: z.enum(["Month", "Year"], {
      required_error: "Payment Frequency type is required",
    }),
    productType: z.enum(["Course", "Academy"], {
      required_error: "Product type if required",
    }),
    productId: string({ required_error: "Product ID is required" }),
  }),
});

export const deleteSubscriptionSchema = object({
  params: object({
    subscriptionId: string({ required_error: "Subscription ID is required" }),
  }),
});
