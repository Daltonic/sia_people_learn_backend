import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Router, Request, Response } from "express";
import SessionService from "@/resources/session/session.service";
import { LoginInterface } from "@/resources/session/session.interface";
import { filteredUser, log } from "@/utils/index";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { loginSchema } from "@/resources/session/session.validation";
import { loggedIn, validateResource } from "@/middlewares/index";
import { get } from "lodash";
import passport, { session } from "passport";
import { IUser } from "../user/user.model";

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

    this.router.get(
      `${this.path}/login/google`,
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
      })
    );

    this.router.get(
      `/auth/google/callback`,
      passport.authenticate("google", {
        session: false,
        successRedirect: `${process.env.SOCIAL_REDIRECT_URL}`,
      }),
      this.socialLoginSuccess
    );

    this.router.get(
      `${this.path}/login/github`,
      passport.authenticate("github", {
        scope: ["user:email"],
        session: false,
      })
    );

    this.router.get(
      `/auth/github/callback`,
      passport.authenticate("github", {
        session: false,
        successRedirect: `${process.env.SOCIAL_REDIRECT_URL}`,
      }),
      this.socialLoginSuccess
    );

    this.router.get(
      `${this.path}/login/twitter`,
      passport.authenticate("twitter", { session: false })
    );
    this.router.get(
      "/auth/twitter/callback",
      passport.authenticate("twitter", {
        session: false,
        successRedirect: `${process.env.SOCIAL_REDIRECT_URL}`,
      }),
      this.socialLoginSuccess
    );

    this.router.get(
      `${this.path}/login/facebook`,
      passport.authenticate("facebook", {
        session: false,
      })
    );
    this.router.get(
      `/auth/facebook/callback`,
      passport.authenticate("facebook", {
        session: false,
        successRedirect: `${process.env.SOCIAL_REDIRECT_URL}`,
      }),
      this.socialLoginSuccess
    );

    this.router.get(`${this.path}/refresh `, this.refresh);

    this.router.delete(`${this.path}/logout`, loggedIn, this.logout);
  }

  private login = async (
    req: Request<{}, {}, LoginInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const loginInput = req.body;

    const { user, accessToken } = req.user as any as {
      user: IUser;
      accessToken: string;
    };

    try {
      if (user && accessToken) {
        res
          .status(StatusCodes.OK)
          .json({ user: filteredUser(user), accessToken });
      }
      const data = await this.sessionService.login(loginInput);
      res.status(StatusCodes.OK).json(data);
    } catch (e: any) {
      log.error(e.message);
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private socialLoginSuccess = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { user, accessToken } = req.user as any as {
        user: IUser;
        accessToken: string;
      };
      console.log(user, accessToken);

      res.json({ user: filteredUser(user), accessToken });

      res.writeHead(301, {
        location: "http://localhost:3000/login",
      });
      res.end();
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const refreshToken = get(req, "headers.x-refresh") as string;

    try {
      const accessToken =
        await this.sessionService.refreshSession(refreshToken);
      res.status(StatusCodes.OK).json({ data: accessToken });
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    try {
      const message = await this.sessionService.logout(userId);
      // Delete user from the res object
      res.locals.user = null;
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default SessionController;
