require('dotenv').config()
import log from '@/utils/logger'
import { ISubscription } from '@/resources/subscription/subscription.model'
import Course from '@/resources/course/course.model'
import Academy from '@/resources/academy/academy.model'
import Promo from '@/resources/promo/promo.model'
import {
  CheckoutProductInterface,
  CheckoutProductsInterface,
  ProductItem,
} from './processors.interface'
import OrderService from '../order/order.service'
import SubscriptionService from '../subscription/subscription.service'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class StripeService {
  private courseModel = Course
  private academyModel = Academy
  private promoModel = Promo
  private order = new OrderService()
  private subscribe = new SubscriptionService()

  public async stripeCheckout(
    checkoutInput: CheckoutProductsInterface,
    userId: string
  ): Promise<object | Error> {
    const { paymentType, promoId, products } = checkoutInput

    try {
      // Create the subscriptions
      const subscriptions = (await this.subscribe.createSubscription(
        { paymentFrequency: 'One-Off', products },
        userId
      )) as ISubscription[]

      const promo = await this.promoModel.findById(promoId)
      const promoPercent: number =
        promo && promo?.validated ? Number(promo?.percentage) : 0

      const subscriptionIds: string[] = []

      const stripeProducts = (await Promise.all(
        subscriptions.map(async (sub) => {
          subscriptionIds.push(String(sub._id))
          if (sub.productModelType === 'Academy') {
            const academy = await this.academyModel.findById(sub.productId)
            return {
              name: academy?.name,
              productId: String(academy?._id),
              image: String(academy?.imageUrl),
              amount: Number(academy?.price),
            }
          } else {
            const course = await this.courseModel.findById(sub.productId)
            return {
              name: course?.name,
              productId: String(course?._id),
              image: String(course?.imageUrl),
              amount: Number(course?.price),
            }
          }
        })
      )) as ProductItem[]

      const customer = await stripe.customers.create({
        metadata: {
          products: JSON.stringify(stripeProducts),
          userId,
          promoId,
          paymentType,
          subscriptionIds: JSON.stringify(subscriptionIds),
        },
      })

      const session = await this.createStripeSession(
        customer,
        stripeProducts,
        promoPercent
      )

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
    const { productId, paymentFrequency, paymentType } = checkoutInput

    try {
      // Ensure that the product exists

      const subscriptions = (await this.subscribe.createSubscription(
        {
          paymentFrequency: paymentFrequency || 'Month',
          products: [
            {
              productId,
              productType: 'Academy',
            },
          ],
        },
        userId
      )) as ISubscription[]

      const subscription: ISubscription = subscriptions[0]

      const academy = await this.academyModel.findById(subscription?.productId)

      let product: ProductItem

      if (academy && academy.validity > 0) {
        product = {
          name: String(academy.name),
          ref: String(academy.ref),
          productId: String(academy.id),
          image: String(academy.imageUrl),
          amount: Number(academy.price),
          interval: academy.validity,
        }
      } else {
        return Promise.reject(new Error('Product not subscribable'))
      }

      const customer = await stripe.customers.create({
        metadata: {
          product: JSON.stringify(product),
          userId,
          paymentType,
          subscriptionIds: JSON.stringify([subscription._id]),
        },
      })

      const prices = await stripe.prices.list({ product: product.ref })
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
    products: ProductItem[],
    discountPercentage: number = 0
  ): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: .30

    const lineItems = products.map((product) => {
      const discountAmount = product.amount * (discountPercentage / 100)
      const discountedAmount = product.amount - discountAmount

      const taxAmount = discountedAmount * (taxPercentage / 100)
      const unitAmount = Math.round(
        (discountedAmount + taxAmount + fixedFee / 100) * 100
      )

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image],
            description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing. ${
              discountPercentage > 0
                ? 'Discount applied: ' + discountPercentage + '%'
                : ''
            }`,
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

  public async manageProduct(product: ProductItem): Promise<any> {
    try {
      // Attempt to retrieve the product to check if it exists
      await stripe.products.retrieve(product.ref)
      // If the product exists, update it
      return await this.updateProduct(product)
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'rawType' in error &&
        'param' in error
      ) {
        const err = error as { rawType: string; param: string }
        if (err.rawType === 'invalid_request_error' && err.param === 'id') {
          // If the product does not exist, create it
          return await this.createProduct(product)
        }
      }
      // If there's another error, rethrow it
      throw error
    }
  }

  private async updateProduct(product: ProductItem): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: $0.30

    const productResponse = await stripe.products.update(product.ref, {
      name: product.name,
      images: [product.image],
      description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`,
      metadata: {
        ...product,
      },
    })

    // After updating the product, create a new price
    return await this.createPrice({
      ...product,
      ref: productResponse.id,
    })
  }

  private async createProduct(product: ProductItem): Promise<any> {
    const taxPercentage = 2.9 // Stripe tax rate: 2.9%
    const fixedFee = 30 // Stripe fixed fee: $0.30

    const productResponse = await stripe.products.create({
      name: product.name,
      images: [product.image],
      description: `This product(s) includes tax of ${taxPercentage}% + ${fixedFee}¢ for stripe processing.`,
      metadata: {
        ...product,
      },
    })

    // After creating the product, create a new price
    return await this.createPrice({
      ...product,
      ref: productResponse.id,
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
      product: product.ref,
    })
  }

  public async webhook(payload: any, signature: any): Promise<object | Error> {
    const secret = process.env.STRIPE_ENDPOINT_SECRET
    try {
      const event = await stripe.webhooks.constructEvent(
        payload,
        signature,
        secret
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const transactionRef = session.payment_intent
        const paymentMode = session.mode

        if (paymentMode === 'payment') {
          const customer = await stripe.customers.retrieve(session.customer)
          const subscriptions: string[] = JSON.parse(
            customer.metadata.subscriptionIds
          )
          // update the subscriptions table for each product of a specific user

          const userId = customer.metadata.userId
          const promoId = customer.metadata.promoId
          const paymentType = customer.metadata.paymentType

          this.order.createOrder({
            userId,
            promoId,
            paymentType,
            transactionRef,
            subscriptions,
          })
        }
      } else if (event.type === 'invoice.paid') {
        const session = event.data.object
        const transactionRef = session.payment_intent
        const subscriptionId = session.subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        if (subscription) {
          const customer = await stripe.customers.retrieve(
            subscription.customer
          )

          const subscriptions: string[] = JSON.parse(
            customer.metadata.subscriptionIds
          )
          // update the subscriptions table for this product of a specific user
          const userId = customer.metadata.userId
          const paymentType = customer.metadata.paymentType

          this.order.createOrder({
            userId,
            paymentType,
            transactionRef,
            subscriptions,
          })
        }
      }

      return {}
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error checking out with stripe')
    }
  }
}
export default StripeService
