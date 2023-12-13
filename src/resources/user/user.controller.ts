import Controller from "@/utils/interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from "express";
import UserService from "@/resources/user/user.service";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyUserSchema,
  updatePasswordSchema,
  upgradeUserSchema,
  downgradeUserSchema,
} from "@/resources/user/user.validation";
import {
  ForgotPasswordInterface,
  RegisterInterface,
  VerifyUserInterface,
  ResetPasswordInterface,
  UpdatePasswordInterface,
  UpgradeUserInterface,
  DowngradeUserInterface,
} from "@/resources/user/user.interface";
import { StatusCodes } from "http-status-codes";
import HttpException from "@/utils/exceptions/HttpException";
import { isAdmin, loggedIn, validateResource } from "@/middlewares/index";

class UserController implements Controller {
  public path = "/users";
  public router = Router();
  private userService = new UserService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/register`,
      validateResource(registerSchema),
      this.register
    );

    this.router.get(
      `${this.path}/verify`,
      validateResource(verifyUserSchema),
      this.verify
    );

    this.router.post(
      `${this.path}/forgotPassword`,
      validateResource(forgotPasswordSchema),
      this.forgotPassword
    );

    this.router.post(
      `${this.path}/resetPassword`,
      validateResource(resetPasswordSchema),
      this.resetPassword
    );

    this.router.put(
      `${this.path}/updatePassword`,
      [loggedIn, validateResource(updatePasswordSchema)],
      this.updatePassword
    );

    this.router.put(
      `${this.path}/upgrade`,
      [isAdmin, validateResource(upgradeUserSchema)],
      this.upgradeUser
    );

    this.router.put(
      `${this.path}/downgrade`,
      [isAdmin, validateResource(downgradeUserSchema)],
      this.downgradeUser
    );
  }

  private register = async (
    req: Request<{}, {}, RegisterInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const userInput = req.body;

    try {
      const message = await this.userService.register(userInput);
      res.status(StatusCodes.CREATED).json({ msg: message });
    } catch (e: any) {
      if (e.code === 11000) {
        next(new HttpException(StatusCodes.CONFLICT, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private verify = async (
    req: Request<{}, {}, {}, VerifyUserInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const verificationInput = req.query;

    try {
      const message = await this.userService.verify(verificationInput);
      res.status(StatusCodes.OK).json({ msg: message });
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const forgotPasswordInput = req.body;

    try {
      const message =
        await this.userService.forgotPassword(forgotPasswordInput);
      res.status(StatusCodes.OK).json({ msg: message });
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private resetPassword = async (
    req: Request<
      {},
      {},
      ResetPasswordInterface["body"],
      ResetPasswordInterface["query"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const resetPasswordQuery = req.query;
    const resetPasswordBody = req.body;

    try {
      const message = await this.userService.resetPassword(
        resetPasswordQuery,
        resetPasswordBody
      );
      res.status(StatusCodes.OK).json({ msg: message });
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private updatePassword = async (
    req: Request<{}, {}, UpdatePasswordInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const updatePasswordInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.userService.updatePassword(
        updatePasswordInput,
        userId
      );
      res.status(StatusCodes.OK).json({ msg: message });
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private upgradeUser = async (
    req: Request<{}, {}, UpgradeUserInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const upgradeInput = req.body;
    try {
      const message = await this.userService.upgradeUser(upgradeInput);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private downgradeUser = async (
    req: Request<{}, {}, DowngradeUserInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const downgradeInput = req.body;
    try {
      const message = await this.userService.downgradeUser(downgradeInput);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default UserController;
