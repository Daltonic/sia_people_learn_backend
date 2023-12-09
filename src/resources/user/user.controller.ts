import Controller from "@/utils/interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from "express";
import UserService from "./user.service";
import validateResource from "@/middlewares/validation.middleware";
import { registerSchema } from "./user.validation";
import { RegisterInterface } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import HttpException from "@/utils/exceptions/HttpException";

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
      console.log(e);
      if (e.code === 11000) {
        next(new HttpException(StatusCodes.CONFLICT, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };
}

export default UserController;
