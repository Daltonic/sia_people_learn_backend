import { NextFunction, Request, Response, Router, query } from "express";
import AcademyService from "@/resources/academy/academy.services";
import Controller from "@/utils/interfaces/controller.interface";
import {
  ApproveAcademyInterface,
  CreateAcademyInterface,
  DeleteAcademyInterface,
  FetchAcademiesInterface,
  FetchAcademyInterface,
  SubmitAcademyInterface,
  UpdateAcademyInterface,
} from "@/resources/academy/academy.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import validateResource from "@/middlewares/validation.middleware";
import {
  approveAcademySchema,
  createAcademySchema,
  deleteAcademySchema,
  fetchAcademiesSchema,
  fetchAcademySchema,
  submitAcademySchema,
  updateAcademySchema,
} from "@/resources/academy/academy.validation";
import { loggedIn, isAdmin, isAdminOrInstructor } from "@/middlewares/index";

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
      [isAdminOrInstructor, validateResource(createAcademySchema)],
      this.createAcademy
    );

    this.router.put(
      `${this.path}/update/:academyId`,
      [isAdminOrInstructor, validateResource(updateAcademySchema)],
      this.updateAcademy
    );

    this.router.get(
      `${this.path}/:academyId`,
      validateResource(fetchAcademySchema),
      this.fetchAcademy
    );

    this.router.get(
      `${this.path}`,
      [validateResource(fetchAcademiesSchema)],
      this.fetchAcademies
    );

    this.router.put(
      `${this.path}/submit/:academyId`,
      [isAdminOrInstructor, validateResource(submitAcademySchema)],
      this.submitAcademy
    );

    this.router.put(
      `${this.path}/approve/:academyId`,
      [isAdmin, validateResource(approveAcademySchema)],
      this.approveAcademy
    );

    this.router.delete(
      `${this.path}/delete/:academyId`,
      [isAdminOrInstructor, validateResource(deleteAcademySchema)],
      this.deleteAcademy
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

  private updateAcademy = async (
    req: Request<
      UpdateAcademyInterface["params"],
      {},
      UpdateAcademyInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const academyInput = req.body;
    const { academyId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const result = await this.academyService.updateAcademy(
        academyInput,
        academyId,
        userId
      );
      res.status(StatusCodes.OK).json(result);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private fetchAcademy = async (
    req: Request<FetchAcademyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { academyId } = req.params;
    try {
      const course = await this.academyService.fetchAcademy(academyId);
      res.status(StatusCodes.OK).json(course);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchAcademies = async (
    req: Request<{}, {}, {}, FetchAcademiesInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const queryOptions = req.query;
    const userId = res.locals?.user?._id;
    try {
      const result = await this.academyService.fetchAcademies(
        queryOptions,
        userId
      );
      res.status(StatusCodes.OK).json(result);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private submitAcademy = async (
    req: Request<SubmitAcademyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { academyId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.academyService.submitAcademy(
        academyId,
        userId
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private approveAcademy = async (
    req: Request<ApproveAcademyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { academyId } = req.params;
    try {
      const message = await this.academyService.approveAcademy(academyId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private deleteAcademy = async (
    req: Request<DeleteAcademyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { academyId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.academyService.deleteAcademy(
        academyId,
        userId
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };
}

export default AcademyController;
