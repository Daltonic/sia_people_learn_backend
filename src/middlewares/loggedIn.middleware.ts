import HttpException from "@/utils/exceptions/HttpException";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export default function loggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = res.locals.user;

  if (!user) {
    next(
      new HttpException(
        StatusCodes.UNAUTHORIZED,
        "Not authorised to access this route"
      )
    );
  } else {
    next();
  }
}
