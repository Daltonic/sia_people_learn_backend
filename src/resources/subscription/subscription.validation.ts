import { number, object, string, z } from "zod";

export const createSubsciptionSchema = object({
  body: object({
    orderId: string().optional(),
    paymentFrequency: z.enum(["month", "year"], {
      required_error: "Payment Frequency is required",
    }),
    productType: z.enum(["course", "academy"], {
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

export const fetchSubscriptionsSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    filter: z.enum(["newest", "oldest", "recommended"]).optional(),
    status: z.enum(["pending", "completed"]).optional(),
    productType: z.enum(["academy", "course"]).optional(),
  }),
});
