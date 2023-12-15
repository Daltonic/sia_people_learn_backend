import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Router, Response } from "express";
import {
  CreateSubscriptionInterface,
  DeleteSubscriptionInterface,
} from "@/resources/subscription/subscription.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import SubscriptionService from "@/resources/subscription/subscription.service";

import { validateResource, loggedIn, isAdmin } from "@/middlewares/index";
import {
  createSubsciptionSchema,
  deleteSubscriptionSchema,
} from "@/resources/subscription/subscription.validation";

class SubscriptionController implements Controller {
  public path = "/subscriptions";
  public router = Router();
  private subscriptionService = new SubscriptionService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [loggedIn, validateResource(createSubsciptionSchema)],
      this.createSubscription
    );

    this.router.get(`${this.path}`, isAdmin, this.fetchSubscriptions);

    this.router.delete(
      `${this.path}/delete/:subscriptionId`,
      [loggedIn, validateResource(deleteSubscriptionSchema)],
      this.deleteSubscription
    );

    this.router.get(`${this.path}/user`, loggedIn, this.fetchUserSubscriptions);
  }

  private createSubscription = async (
    req: Request<{}, {}, CreateSubscriptionInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const subscriptionInput = req.body;
    const { _id: userId } = res.locals.user;
    try {
      const subscription = await this.subscriptionService.createSubscription(
        subscriptionInput,
        userId
      );
      res.status(StatusCodes.CREATED).json(subscription);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private deleteSubscription = async (
    req: Request<DeleteSubscriptionInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    const { subscriptionId } = req.params;
    try {
      const message = await this.subscriptionService.deleteSubscription(
        subscriptionId,
        userId
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "User not permitted to delete this subscription") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        if (e.message.includes("Cast to ObjectId")) {
          next(
            new HttpException(StatusCodes.BAD_REQUEST, "Subscription not found")
          );
        } else {
          next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
        }
      }
    }
  };

  private fetchSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const subscriptions = await this.subscriptionService.fetchSubscriptions();
      res.status(StatusCodes.OK).json(subscriptions);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchUserSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    try {
      const subscriptions =
        await this.subscriptionService.fetchUserSubscriptions(userId);
      res.status(StatusCodes.OK).json(subscriptions);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default SubscriptionController;
