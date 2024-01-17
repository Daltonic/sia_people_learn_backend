import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Router, Request, Response } from "express";
import LessonService from "@/resources/lesson/lesson.service";
import {
  CreateLessonInterface,
  DeleteLessonInterface,
  FetchLessonInterface,
  FetchLessonsInterface,
  UpdateLessonInterface,
} from "@/resources/lesson/lesson.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import {
  createLessonSchema,
  deleteLessonSchema,
  fetchLessonSchema,
  fetchLessonsSchema,
  updateLessonSchema,
} from "@/resources/lesson/lesson.validation";
import {
  isAdminOrInstructor,
  loggedIn,
  validateResource,
} from "@/middlewares/index";

class LessonController implements Controller {
  public path = "/lessons";
  public router = Router();
  private lessonService = new LessonService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [isAdminOrInstructor, validateResource(createLessonSchema)],
      this.createLesson
    );

    this.router.put(
      `${this.path}/update/:lessonId`,
      [isAdminOrInstructor, validateResource(updateLessonSchema)],
      this.updateLesson
    );

    this.router.delete(
      `${this.path}/delete/:lessonId`,
      [isAdminOrInstructor, validateResource(deleteLessonSchema)],
      this.deleteLesson
    );

    this.router.get(
      `${this.path}/:lessonId`,
      [loggedIn, validateResource(fetchLessonSchema)],
      this.fetchLesson
    );

    this.router.get(
      `${this.path}`,
      [loggedIn, validateResource(fetchLessonsSchema)],
      this.fetchLessons
    );
  }

  private createLesson = async (
    req: Request<{}, {}, CreateLessonInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    const lessonInput = req.body;

    try {
      const lesson = await this.lessonService.createLesson(lessonInput, userId);
      res.status(StatusCodes.CREATED).json(lesson);
    } catch (e: any) {
      console.log(e.message);
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private updateLesson = async (
    req: Request<
      UpdateLessonInterface["params"],
      {},
      UpdateLessonInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { lessonId } = req.params;
    const lessonInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const lesson = await this.lessonService.updateLesson(
        lessonInput,
        lessonId,
        userId
      );
      res.status(StatusCodes.OK).json(lesson);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private deleteLesson = async (
    req: Request<DeleteLessonInterface>,
    res: Response,
    next: NextFunction
  ) => {
    const { lessonId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.lessonService.deleteLesson(lessonId, userId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private fetchLesson = async (
    req: Request<FetchLessonInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { lessonId } = req.params;
    try {
      const lesson = await this.lessonService.fetchLesson(lessonId);
      res.status(StatusCodes.OK).json(lesson);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchLessons = async (
    req: Request<{}, {}, {}, FetchLessonsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { courseId } = req.query;
    try {
      const lessons = await this.lessonService.fetchLessons(courseId);
      res.status(StatusCodes.OK).json(lessons);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default LessonController;
