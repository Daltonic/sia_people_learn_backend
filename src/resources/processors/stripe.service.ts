require('dotenv').config()
import log from '@/utils/logger'
import Course from '@/resources/course/course.model'
import Academy from '@/resources/academy/academy.model'
import {
  CheckoutProductInterface,
  CheckoutProductsInterface,
  ProductItem,
} from './processors.interface'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class StripeService {
  private courseModel = Course
  private academyModel = Academy

  public async stripeCheckout(
    checkoutInput: CheckoutProductsInterface,
    userId: string
  ): Promise<object | Error> {
    const { productIds, productType } = checkoutInput

    try {
      // Ensure that the product exists
      const products: ProductItem[] = []

      for (let index = 0; index < productIds.length; index++) {
        let productItem
        
        if(productType === "Academy") {
          productItem = await this.academyModel.findById(productIds[index])
        } else {
          productItem = await this.courseModel.findById(productIds[index])
        }

        if (productItem) {
          products.push({
            name: String(productItem.name),
            productId: String(productItem.id),
            image: String(productItem.imageUrl),
            amount: Number(productItem.price),
          })
        }
      }

      const customer = await stripe.customers.create({
        metadata: {
          products: JSON.stringify(products),
          userId,
        },
      })

      const session = await this.createStripeSession(customer, products)

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

  public async stripeSubscribe(
    checkoutInput: CheckoutProductInterface,
    userId: string
  ): Promise<object | Error> {
    const { productId } = checkoutInput

    try {
      // Ensure that the product exists
      const academy = await this.academyModel.findById(productId)
      let product: ProductItem

      if (academy && academy.validity > 0) {
        product = {
          name: String(academy.name),
          productId: String(academy.ref),
          image: String(academy.imageUrl),
          amount: Number(academy.price),
          interval: academy.validity,
        }
      } else {
        return Promise.reject('Subscribable Academy Not Found')
      }

      const customer = await stripe.customers.create({
        metadata: {
          product: JSON.stringify(product),
          userId,
        },
      })

      const prices = await stripe.prices.list({ product: product.productId })
      const price = prices.data[0]
      const session = await this.createStripeSubscription(customer, price)

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

  private async createStripeSubscription(
    customer: any,
    price: any
  ): Promise<any> {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: customer.id,
      success_url: process.env.SUCCESS_URI,
      cancel_url: process.env.CANCEL_URI,
    })
  }

  private async createStripeSession(
    customer: any,
    products: ProductItem[]
  ): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: .30

    const lineItems = products.map((product) => {
      const taxAmount = product.amount * (taxPercentage / 100)
      const unitAmount = Math.round(
        (product.amount + taxAmount + fixedFee / 100) * 100
      )

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image],
            description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }
    })

    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer: customer.id,
      success_url: process.env.SUCCESS_URI,
      cancel_url: process.env.CANCEL_URI,
    })
  }

  public async updateProduct(product: ProductItem): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: $0.30

    const productResponse = await stripe.products.update(product.productId, {
      name: product.name,
      images: [product.image],
      description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`,
      metadata: {
        productId: product.productId,
      },
    })

    // After updating the product, create a new price
    return await this.createPrice({
      ...product,
      productId: productResponse.id,
    })
  }

  public async createProduct(product: ProductItem): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: $0.30

    const productResponse = await stripe.products.create({
      name: product.name,
      images: [product.image],
      description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`,
      metadata: {
        productId: product.productId,
      },
    })

    // After creating the product, create a new price
    return await this.createPrice({
      ...product,
      productId: productResponse.id,
    })
  }

  private async createPrice(product: ProductItem): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: $0.30

    const taxAmount = product.amount * (taxPercentage / 100)
    const unitAmount = Math.round(
      (product.amount + taxAmount + fixedFee / 100) * 100
    )

    return await stripe.prices.create({
      unit_amount: unitAmount,
      currency: 'usd',
      recurring: { interval: 'month', interval_count: product.interval },
      product: product.productId,
    })
  }
}
export default StripeService