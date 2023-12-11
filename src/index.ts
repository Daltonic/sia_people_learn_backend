import "dotenv/config";
import "module-alias/register";
import App from "./app";
import { validateEnv } from "@/utils/index";
import UserController from "@/resources/user/user.controller";
import SessionController from "@/resources/session/session.controller";
import CourseController from "@/resources/course/course.controller";
import LessonController from "@/resources/lesson/lesson.controller";

validateEnv();

const app = new App(
  [
    new UserController(),
    new SessionController(),
    new CourseController(),
    new LessonController(),
  ],
  Number(process.env.PORT)
);

app.listen();
