import { NextFunction, Request, Response, Router } from "express";
import AcademyService from "@/resources/academy/academy.services";
import Controller from "@/utils/interfaces/controller.interface";
import { CreateAcademyInterface } from "@/resources/academy/academy.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import isCreator from "@/middlewares/isCreator";
import validateResource from "@/middlewares/validation.middleware";
import { createAcademySchema } from "@/resources/academy/academy.validation";

class AcademyController implements Controller {
  public path = "/academies";
  public router = Router();
  private academyService = new AcademyService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes = () => {
    this.router.post(
      `${this.path}/create`,
      [isCreator, validateResource(createAcademySchema)],
      this.createAcademy
    );
  };

  private createAcademy = async (
    req: Request<{}, {}, CreateAcademyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const academyInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const result = await this.academyService.createAcademy(
        academyInput,
        userId
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default AcademyController;
