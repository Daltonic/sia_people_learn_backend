import Controller from '@/utils/interfaces/controller.interface'
import { NextFunction, Request, Response, Router } from 'express'
import HttpException from '@/utils/exceptions/HttpException'
import { StatusCodes } from 'http-status-codes'
import { loggedIn } from '@/middlewares/index'
import SiaService from './sia.service'
import { FileUpload } from './media.interface'

class MediaController implements Controller {
  public path = '/media'
  public router = Router()
  private siaService = new SiaService()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes() {
    this.router.get(
      `${this.path}/sia/download/:folder/:fileId`,
      [],
      this.sendFile
    )
    this.router.post(`${this.path}/sia/upload`, [loggedIn], this.receiveFile)
  }

  private receiveFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.files) {
        throw new HttpException(StatusCodes.NO_CONTENT, 'No file uploaded')
      }
      const fileUpload: FileUpload = req.files.file as FileUpload
      const result = await this.siaService.uploadFile(fileUpload)

      return res.status(StatusCodes.CREATED).json(result)
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message))
    }
  }

  private sendFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { folder, fileId } = req.params

    try {
      if (!folder || !fileId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'Folder or File ID not found' })
      } else {
        const result = await this.siaService.downloadFile(folder, fileId)
        return result.pipe(res).status(StatusCodes.OK)
      }
    } catch (error: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, error.message))
    }
  }
}

export default MediaController
