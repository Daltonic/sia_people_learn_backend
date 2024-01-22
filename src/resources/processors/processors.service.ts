require('dotenv').config()
import log from '@/utils/logger'
import Course from '@/resources/course/course.model'
import { CheckoutProductsInterface, ProductItem } from './processors.interface'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class ProcessorsService {
  private courseModel = Course

  public async stripeCheckout(
    checkoutInput: CheckoutProductsInterface,
    userId: string
  ): Promise<object | Error> {
    const { productIds } = checkoutInput

    try {
      // Ensure that the product exists
      const products: ProductItem[] = []
      let totalAmount: number = 0

      for (let index = 0; index < productIds.length; index++) {
        const course = await this.courseModel.findById(productIds[index])

        if(course) {
          products.push({
            name: String(course.name),
            productId: String(course.id),
            image: String(course.imageUrl),
            amount: Number(course.price),
          })
          totalAmount += Number(course.price)
        }
      }

      const customer = await stripe.customers.create({
       metadata: {
          products: JSON.stringify(products),
          userId
       },
      })
      const taxPercentage = 2.9 // Stripe tax rate: 2.9%
      const fixedFee = 30 // Stripe fixed fee: $0.30
      const descriptionWithCaveat = `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`

    const lineItems = products.map((product) => {
     const taxAmount = product.amount * (taxPercentage / 100);
     const unitAmount = (product.amount + taxAmount + fixedFee / 100) * 100;

     return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image],
            description: descriptionWithCaveat,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
     };
    });
    
    const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: lineItems,
     mode: 'payment',
     customer: customer.id,
     success_url: process.env.SUCCESS_URI,
     cancel_url: process.env.CANCEL_URI,
    });
    

    if (session.url) {
      return Promise.resolve(session)
    } else {
      return Promise.reject()
    }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error checking out with stripe')
    }
  }
}
export default ProcessorsService
