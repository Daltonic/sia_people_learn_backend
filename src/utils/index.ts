import generateAlphanumeric from "./generateAlphanum";
import log from "./logger";
import { filteredUser } from "./responseFilter";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./token";
import validateEnv from "./validateEnv";

const createSlug = (name: string): string => {
  let slug = name.toLowerCase();

  // Remove special characters and spaces
  slug = slug.replace(/[^a-z0-9]+/g, "-");

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  slug = `${slug}-${generateAlphanumeric(6)}`.toLowerCase();
  return slug;
};

export {
  generateAlphanumeric,
  log,
  filteredUser,
  createAccessToken,
  createRefreshToken,
  validateEnv,
  verifyAccessToken,
  verifyRefreshToken,
  createSlug,
};
