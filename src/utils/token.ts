// Create and validate tokens;

import jwt from "jsonwebtoken";
import { IUser } from "@/resources/user/user.model";

export const createAccessToken = (user: IUser) => {
  const {
    _id,
    firstName,
    lastName,
    email,
    username,
    userType,
    createdAt,
    updatedAt,
    rememberMe,
    imgUrl,
  } = user;
  const payload = {
    _id,
    firstName,
    lastName,
    email,
    username,
    userType,
    createdAt,
    updatedAt,
    rememberMe,
    imgUrl,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY!, {
    expiresIn: "10m",
  });
};

export function verifyAccessToken<T>(accessToken: string): T | null {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY!
    ) as T;
    return decoded;
  } catch (e: any) {
    return null;
  }
}
