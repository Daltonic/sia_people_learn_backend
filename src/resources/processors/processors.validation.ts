import { object, string } from 'zod'

export const checkoutProductsSchema = object({
  body: object({
    productIds: string({ required_error: 'Product IDs is required' }).array(),
  }),
})