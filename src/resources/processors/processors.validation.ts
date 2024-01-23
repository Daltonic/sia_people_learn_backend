import { object, string, z } from 'zod'

export const checkoutProductsSchema = object({
  body: object({
    productIds: string({ required_error: 'Product IDs is required' }).array(),
    productType: z.enum(["Course", "Book", "Academy"], { required_error: "type is required" }),
  }),
})

export const checkoutProductSchema = object({
  body: object({
    productId: string({ required_error: 'Product ID is required' }),
  }),
})