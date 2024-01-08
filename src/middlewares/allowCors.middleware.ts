import HttpException from "@/utils/exceptions/HttpException";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.header("Access-Control-Allow-Origin", "*");

  next();
}
