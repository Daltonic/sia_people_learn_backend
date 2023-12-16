import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import TestimonyService from "@/resources/testimony/testimony.services";
import {
  ApproveTestimonyInterface,
  CreateTestimonyInterface,
  DeleteTestimonyInterface,
  UpdateTestimonyInterface,
} from "@/resources/testimony/testimony.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { isAdmin, loggedIn, validateResource } from "@/middlewares/index";
import {
  approveTestimonySchema,
  createTestimonySchema,
  deleteTestimonySchema,
  updateTestimonySchema,
} from "@/resources/testimony/testimony.validation";

class TestimonyController implements Controller {
  public path = "/testimonies";
  public router = Router();
  private testimonyService = new TestimonyService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [loggedIn, validateResource(createTestimonySchema)],
      this.createTestimony
    );

    this.router.put(
      `${this.path}/update/:testimonyId`,
      [loggedIn, validateResource(updateTestimonySchema)],
      this.updateTestimony
    );

    this.router.put(
      `${this.path}/approve/:testimonyId`,
      [isAdmin, validateResource(approveTestimonySchema)],
      this.approveTestimony
    );

    this.router.delete(
      `${this.path}/:testimonyId`,
      [loggedIn, validateResource(deleteTestimonySchema)],
      this.deleteTestimony
    );

    this.router.get(`${this.path}`, isAdmin, this.fetchTestimonies);

    this.router.get(`${this.path}/user`, loggedIn, this.fetchUserTestimonies);
  }

  private createTestimony = async (
    req: Request<{}, {}, CreateTestimonyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const testimonyInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const testimony = await this.testimonyService.createTestimony(
        testimonyInput,
        userId
      );
      res.status(StatusCodes.CREATED).json(testimony);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private updateTestimony = async (
    req: Request<
      UpdateTestimonyInterface["params"],
      {},
      UpdateTestimonyInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    const { testimonyId } = req.params;
    const testimonyInput = req.body;

    try {
      const testimony = await this.testimonyService.updateTestimony(
        testimonyInput,
        testimonyId,
        userId
      );
      res.status(StatusCodes.OK).json(testimony);
    } catch (e: any) {
      if (e.message === "You are not permitted to update this Testimony") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private approveTestimony = async (
    req: Request<ApproveTestimonyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { testimonyId } = req.params;
    try {
      const message = await this.testimonyService.approveTestimony(testimonyId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private deleteTestimony = async (
    req: Request<DeleteTestimonyInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { testimonyId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.testimonyService.deleteTestimony(
        testimonyId,
        userId
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "You are not permitted to delete this Testimony") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private fetchUserTestimonies = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    try {
      const testimonies =
        await this.testimonyService.fetchUserTestimonies(userId);
      res.status(StatusCodes.OK).json(testimonies);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchTestimonies = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const testimonies = await this.testimonyService.fetchTestimonies();
      res.status(StatusCodes.OK).json(testimonies);
    } catch (e: any) {
      next(new HttpException(StatusCodes.OK, e.message));
    }
  };
}

export default TestimonyController;
