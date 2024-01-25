import Controller from '@/utils/interfaces/controller.interface'
import { NextFunction, Request, Response, Router } from 'express'
import HttpException from '@/utils/exceptions/HttpException'
import { StatusCodes } from 'http-status-codes'
import { loggedIn, validateResource } from '@/middlewares/index'
import { checkoutProductSchema, checkoutProductsSchema } from './processors.validation'
import { CheckoutProductInterface, CheckoutProductsInterface } from './processors.interface'
import ProcessorsService from './stripe.service'

interface RawBodyRequest extends Request {
  rawBody?: string;
}


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
      ),
      this.router
        .post(
          `${this.path}/stripe/webhook`,
          this.stripeWebhook
        );
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

  private stripeWebhook = async (
    req: RawBodyRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const rawBody = req.rawBody;
    const signature = req.headers['stripe-signature'];

    try {
      const processor = await this.processorsService.webhook(
        rawBody,
        signature
      )
      res.status(StatusCodes.OK).json(processor);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  }
}
export default ProcessorsController
