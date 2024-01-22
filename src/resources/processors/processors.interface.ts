import { TypeOf } from 'zod'
import { checkoutProductsSchema } from './processors.validation'

export type CheckoutProductsInterface = TypeOf<
  typeof checkoutProductsSchema
>['body']

export interface ProductItem {
  productId: string
  name: string
  amount: number
  image: string
}
