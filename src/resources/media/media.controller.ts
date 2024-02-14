import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { loggedIn } from "@/middlewares/index";
import SiaService from "./sia.service";
import { FileUpload } from "./media.interface";

class MediaController implements Controller {
  public path = "/media";
  public router = Router();
  private siaService = new SiaService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.get(`${this.path}/sia/download`, [], this.download);
    this.router.post(`${this.path}/sia/upload`, [loggedIn], this.upload);
  }

  private upload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (!req.files) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "No file uploaded");
      }
      const fileUpload: FileUpload = req.files.file as FileUpload;
      const result = await this.siaService.uploadFile(fileUpload);

      return res.status(StatusCodes.CREATED).json(result);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private download = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { fileType, fileId } = req.query;

    try {
      if (!fileType) {
        throw new HttpException(
          StatusCodes.BAD_REQUEST,
          "File type is required"
        );
      }
      if (!fileId) {
        throw new HttpException(StatusCodes.BAD_REQUEST, "File Id is required");
      }

      const result = await this.siaService.downloadFile(
        String(fileType),
        String(fileId)
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default MediaController;
