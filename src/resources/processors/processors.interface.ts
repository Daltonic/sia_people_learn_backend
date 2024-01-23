import { TypeOf } from 'zod'
import { checkoutProductSchema, checkoutProductsSchema } from './processors.validation'

export type CheckoutProductsInterface = TypeOf<
  typeof checkoutProductsSchema
>['body']

export type CheckoutProductInterface = TypeOf<
  typeof checkoutProductSchema
>['body']

export interface ProductItem {
  productId: string
  name: string
  amount: number
  image: string
  interval?: number
}
