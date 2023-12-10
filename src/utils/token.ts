// Create and validate tokens;

import jwt from "jsonwebtoken";
import { IUser } from "@/resources/user/user.model";
import { filteredUser } from "./response-filter";

export const createAccessToken = (user: IUser) => {
  const payload = filteredUser(user);
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

export const createRefreshToken = (sessionId: string) => {
  const payload = { session: sessionId };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY!, {
    expiresIn: "1d",
  });
};

export function verifyRefreshToken<T>(refreshToken: string): T | null {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY as string
    ) as T;
    return decoded;
  } catch (e: any) {
    return null;
  }
}
