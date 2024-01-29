import { object, string, z } from 'zod'

export const checkoutProductsSchema = object({
  body: object({
    subscriptionIds: string({ required_error: 'Subscription IDs is required' }).array(),
    paymentType: z.enum(["Stripe"], { required_error: "Payment Type is required" }),
    promoId: string().optional(),
  }),
})

export const checkoutProductSchema = object({
  body: object({
    subscriptionId: string({ required_error: 'Subscription ID is required' }),
    paymentFrequency: z.enum(["Month", "Year"], { required_error: "Product Type is required" }),
    paymentType: z.enum(["Stripe"], { required_error: "Payment Type is required" }),
  }),
})