import "dotenv/config";
import "module-alias/register";
import App from "./app";
import validateEnv from "@/utils/validate-env";
import UserController from "@/resources/user/user.controller";
import SessionController from "@/resources/session/session.controller";

validateEnv();

const app = new App(
  [new UserController(), new SessionController()],
  Number(process.env.PORT)
);

app.listen();
