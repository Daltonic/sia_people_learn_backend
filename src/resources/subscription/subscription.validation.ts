import { object, string, z } from "zod";

export const createSubsciptionSchema = object({
  body: object({
    orderId: string().optional(),
    paymentFrequency: z.enum(["Month", "Year", "One-Off"], {
      required_error: "Payment Frequency is required",
    }),
    products: object({
      productId: string({ required_error: "Product ID is required" }),
      productType: z.enum(["Course", "Academy"], {
        required_error: "Product type is required",
      }),
    }).array(),
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
    status: z.enum(["Pending", "Completed"]).optional(),
    productType: z.enum(["Academy", "Course"]).optional(),
  }),
});
