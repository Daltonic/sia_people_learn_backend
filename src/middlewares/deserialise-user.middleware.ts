import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/token";

// Grab user from the accessToken that is passed in from the header;

export default async function deserialiseUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Grab the access token from the header;
  const accessToken = (req.headers.authorization || "").replace(
    /^Bearer\s/,
    ""
  );

  if (!accessToken) {
    return next();
  }

  const decoded = await verifyAccessToken(accessToken);

  if (decoded) {
    res.locals.user = decoded;
  }

  return next();
}
