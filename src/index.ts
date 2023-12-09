import "dotenv/config";
import "module-alias/register";
import App from "./app";
import validateEnv from "@/utils/validate-env";
import UserController from "@/resources/user/user.controller";

validateEnv();

const app = new App([new UserController()], Number(process.env.PORT));

app.listen();
