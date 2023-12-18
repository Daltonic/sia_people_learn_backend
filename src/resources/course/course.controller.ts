import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import CourseService from "@/resources/course/course.service";
import {
  ApproveCourseInterface,
  CreateCourseInterface,
  DeleteCourseInterface,
  FetchCourseInterface,
  FetchCoursesInterface,
  SubmitCourseInterface,
  UpdateCourseInterface,
} from "@/resources/course/course.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import {
  approveCourseSchema,
  createCourseSchema,
  deleteCourseSchema,
  fetchCoursesSchema,
  submitCourseSchema,
  updateCourseSchema,
} from "@/resources/course/course.validation";
import {
  isAdmin,
  isAdminOrInstructor,
  loggedIn,
  validateResource,
} from "@/middlewares/index";

class CourseController implements Controller {
  public path = "/courses";
  public router = Router();
  private courseService = new CourseService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [isAdminOrInstructor, validateResource(createCourseSchema)],
      this.createCourse
    );

    this.router.put(
      `${this.path}/update/:courseId`,
      [isAdminOrInstructor, validateResource(updateCourseSchema)],
      this.updateCourse
    );

    this.router.delete(
      `${this.path}/delete/:courseId`,
      [isAdminOrInstructor, validateResource(deleteCourseSchema)],
      this.deleteCourse
    );

    this.router.get(
      `${this.path}/:courseId`,
      [loggedIn, validateResource(deleteCourseSchema)],
      this.fetchCourse
    );

    this.router.get(
      `${this.path}`,
      validateResource(fetchCoursesSchema),
      this.fetchCourses
    );

    this.router.put(
      `${this.path}/submit/:courseId`,
      [isAdminOrInstructor, validateResource(submitCourseSchema)],
      this.submitCourse
    );

    this.router.put(
      `${this.path}/approve/:courseId`,
      [isAdmin, validateResource(approveCourseSchema)],
      this.approveCourse
    );
  }

  private createCourse = async (
    req: Request<{}, {}, CreateCourseInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const courseInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const course = await this.courseService.createCourse(courseInput, userId);
      res.status(StatusCodes.CREATED).json(course);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private updateCourse = async (
    req: Request<
      UpdateCourseInterface["params"],
      {},
      UpdateCourseInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const updateCourseInput = req.body;
    const { courseId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const updatedCourse = await this.courseService.updateCourse(
        updateCourseInput,
        courseId,
        userId
      );
      res.status(StatusCodes.OK).json(updatedCourse);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private deleteCourse = async (
    req: Request<DeleteCourseInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { courseId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.courseService.deleteCourse(courseId, userId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "User not authorised") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private fetchCourse = async (
    req: Request<FetchCourseInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { courseId } = req.params;

    try {
      const course = await this.courseService.fetchCourse(courseId);
      res.status(StatusCodes.OK).json(course);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchCourses = async (
    req: Request<{}, {}, {}, FetchCoursesInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const queryOptions = req.query;
    try {
      const result = await this.courseService.fetchCourses(queryOptions);
      res.status(StatusCodes.OK).json(result);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private submitCourse = async (
    req: Request<
      SubmitCourseInterface["params"],
      {},
      SubmitCourseInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { courseId } = req.params;
    const { submitted } = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.courseService.submitCourse(
        courseId,
        userId,
        submitted
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

  private approveCourse = async (
    req: Request<ApproveCourseInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { courseId } = req.params;

    try {
      const message = await this.courseService.approveCourse(courseId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default CourseController;
