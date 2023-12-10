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
      res.status(StatusCodes.BAD_REQUEST).send(e);
    }
  };

export default validateResource;
