import Controller from '@/utils/interfaces/controller.interface'
import { NextFunction, Request, Response, Router } from 'express'
import HttpException from '@/utils/exceptions/HttpException'
import { StatusCodes } from 'http-status-codes'
import { loggedIn, validateResource } from '@/middlewares/index'
import { checkoutProductsSchema } from './processors.validation'
import { CheckoutProductsInterface } from './processors.interface'
import ProcessorsService from './processors.service'

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
      console.log(processor);
      res.status(StatusCodes.CREATED).json(processor)
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message))
    }
  }
}

export default ProcessorsController
