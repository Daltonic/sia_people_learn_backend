import { object, string, z } from "zod";

export const checkoutProductsSchema = object({
  body: object({
    products: object({
      productId: string({ required_error: "Product ID is required" }),
      productType: z.enum(["Course", "Academy"], {
        required_error: "Product type is required",
      }),
    }).array(),
    paymentType: z.enum(["Stripe"], {
      required_error: "Payment Type is required",
    }),
    promoId: string().optional(),
  }),
});

export const checkoutProductSchema = object({
  body: object({
    productId: string({ required_error: "Product ID is required" }),
    paymentFrequency: z
      .enum(["Month", "Year"], {
        required_error: "Product Type is required",
      })
      .optional(),
    paymentType: z.enum(["Stripe"], {
      required_error: "Payment Type is required",
    }),
  }),
});