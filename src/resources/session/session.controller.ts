import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Router, Request, Response } from "express";
import SessionService from "@/resources/session/session.service";
import { LoginInterface } from "@/resources/session/session.interface";
import { log } from "@/utils/index";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { loginSchema } from "@/resources/session/session.validation";
import { validateResource } from "@/middlewares/index";

class SessionController implements Controller {
  public path = "/sessions";
  public router = Router();

  private sessionService = new SessionService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/login`,
      validateResource(loginSchema),
      this.login
    );
  }

  private login = async (
    req: Request<{}, {}, LoginInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const loginInput = req.body;

    try {
      const data = await this.sessionService.login(loginInput);
      res.status(StatusCodes.OK).json(data);
    } catch (e: any) {
      log.error(e.message);
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default SessionController;
