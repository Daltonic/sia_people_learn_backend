import HttpException from "@/utils/exceptions/HttpException";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = res.locals.user;

  if (!user || user.userType !== "admin") {
    next(
      new HttpException(
        StatusCodes.UNAUTHORIZED,
        "User not authorised to access the route"
      )
    );
  }

  next();
}
