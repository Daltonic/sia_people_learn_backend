import HttpException from "@/utils/exceptions/HttpException";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function isAdminOrCreator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = res.locals.user;

  if (!user || !["admin", "creator"].includes(user.userType)) {
    next(
      new HttpException(
        StatusCodes.UNAUTHORIZED,
        "User not authorised to access the route"
      )
    );
  } else {
    next();
  }
}
