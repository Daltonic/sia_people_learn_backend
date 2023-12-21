import { cleanEnv, str, url, port } from "envalid";

// Returns sanitised environment Variables
export default function validateEnv(): void {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ["development", "production"],
    }),
    MONGO_URI: str(),
    PORT: port(),
    ACCESS_TOKEN_SECRET_KEY: str(),
    REFRESH_TOKEN_SECRET_KEY: str(),
    ORIGIN: url(),
    LOG_LEVEL: str(),
    ACCESS_TOKEN_EXPIRES_IN: str(),
    MAXIMUM_INSTRUCTOR_PROMO: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GITHUB_CLIENT_ID: str(),
    GITHUB_CLIENT_SECRET: str(),
  });
}
