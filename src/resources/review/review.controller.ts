import { NextFunction, Request, Response, Router } from "express";
import ReviewService from "@/resources/review/review.service";
import {
  ApproveReviewInterface,
  CreateReviewInterface,
  DeleteReviewInterface,
  FetchReviewsInterface,
} from "@/resources/review/review.interface";
import Controller from "@/utils/interfaces/controller.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import {
  isAdmin,
  isAdminOrInstructor,
  loggedIn,
  validateResource,
} from "@/middlewares/index";
import {
  approveReviewSchema,
  createReviewSchema,
  deleteReviewSchema,
  fetchReviewsSchema,
} from "@/resources/review/review.validation";

class ReviewController implements Controller {
  public path = "/reviews";
  public router = Router();
  private reviewService = new ReviewService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [loggedIn, validateResource(createReviewSchema)],
      this.createReview
    );

    this.router.get(
      `${this.path}`,
      [validateResource(fetchReviewsSchema)],
      this.fetchReviews
    );

    this.router.get(`${this.path}/user`, loggedIn, this.fetchUserReviews);

    this.router.put(
      `${this.path}/approve/:reviewId`,
      [isAdminOrInstructor, validateResource(approveReviewSchema)],
      this.approveReview
    );

    this.router.delete(
      `${this.path}/delete/:reviewId`,
      [loggedIn, validateResource(deleteReviewSchema)],
      this.deleteReview
    );
  }

  private createReview = async (
    req: Request<{}, {}, CreateReviewInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const reviewInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const review = await this.reviewService.createReview(reviewInput, userId);
      res.status(StatusCodes.CREATED).json(review);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchReviews = async (
    req: Request<{}, {}, {}, FetchReviewsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const queryOptions = req.query;
    try {
      const reviews = await this.reviewService.fetchReviews(queryOptions);
      res.status(StatusCodes.OK).json(reviews);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchUserReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    try {
      const reviews = await this.reviewService.fetchUserReviews(userId);
      res.status(StatusCodes.OK).json(reviews);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private approveReview = async (
    req: Request<ApproveReviewInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { reviewId } = req.params;
    const { _id: userId } = res.locals.user;
    try {
      const message = await this.reviewService.approveReview(reviewId, userId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.OK, e.message));
    }
  };

  private deleteReview = async (
    req: Request<DeleteReviewInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { reviewId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.reviewService.deleteReview(reviewId, userId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default ReviewController;
