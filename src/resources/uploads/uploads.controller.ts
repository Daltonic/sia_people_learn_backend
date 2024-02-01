import Controller from '@/utils/interfaces/controller.interface'
import { NextFunction, Request, Response, Router } from 'express'
import HttpException from '@/utils/exceptions/HttpException'
import { StatusCodes } from 'http-status-codes'
import { loggedIn } from '@/middlewares/index'
import SiaService from './sia.service'

class UploadsController implements Controller {
  public path = '/uploads'
  public router = Router()
  private siaService = new SiaService()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes() {
    this.router.post(`${this.path}/sia/file`, [loggedIn], this.uploadFile)
  }

  private uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      // codes goes here
      console.log(req.body)
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message))
    }
  }
}
export default UploadsController
