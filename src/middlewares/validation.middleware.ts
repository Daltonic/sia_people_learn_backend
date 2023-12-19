// Validates all payload

import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { StatusCodes } from "http-status-codes";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      let message: string[] = [];
      if (e.name === "ZodError") {
        e.issues.forEach((issue: any) => message.push(issue.message));
      }
      res.status(StatusCodes.BAD_REQUEST).send(message.join(", "));
    }
  };

export default validateResource;
