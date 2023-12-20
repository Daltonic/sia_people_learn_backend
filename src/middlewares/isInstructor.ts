import HttpException from "@/utils/exceptions/HttpException";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function isInstructor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = res.locals.user;

  if (!user || user.userType !== "instructor") {
    next(
      new HttpException(
        StatusCodes.UNAUTHORIZED,
        "You must be an Instructor to access this route"
      )
    );
  }

  next();
}
