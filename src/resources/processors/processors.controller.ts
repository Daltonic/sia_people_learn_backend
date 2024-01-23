import Controller from '@/utils/interfaces/controller.interface'
import { NextFunction, Request, Response, Router } from 'express'
import HttpException from '@/utils/exceptions/HttpException'
import { StatusCodes } from 'http-status-codes'
import { loggedIn, validateResource } from '@/middlewares/index'
import { checkoutProductSchema, checkoutProductsSchema } from './processors.validation'
import { CheckoutProductInterface, CheckoutProductsInterface } from './processors.interface'
import ProcessorsService from './stripe.service'

class ProcessorsController implements Controller {
  public path = '/processors'
  public router = Router()
  private processorsService = new ProcessorsService()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/stripe/checkout`,
      [loggedIn, validateResource(checkoutProductsSchema)],
      this.checkout
    ),
    this.router.post(
      `${this.path}/stripe/subscribe`,
      [loggedIn, validateResource(checkoutProductSchema)],
      this.subscribe
    )
  }

  private checkout = async (
    req: Request<{}, {}, CheckoutProductsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const checkoutInput = req.body
    const { _id: userId } = res.locals.user
    try {
      const processor = await this.processorsService.stripeCheckout(
        checkoutInput,
        userId
      )
      res.status(StatusCodes.CREATED).json(processor)
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message))
    }
  }
  
  private subscribe = async (
    req: Request<{}, {}, CheckoutProductInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const checkoutInput = req.body
    const { _id: userId } = res.locals.user
    try {
      const processor = await this.processorsService.stripeSubscribe(
        checkoutInput,
        userId
      )
      res.status(StatusCodes.CREATED).json(processor)
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message))
    }
  }
}

export default ProcessorsController
