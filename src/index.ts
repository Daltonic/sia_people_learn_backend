import "dotenv/config";
import "module-alias/register";
import App from "./app";
import { validateEnv } from "@/utils/index";
import UserController from "@/resources/user/user.controller";
import SessionController from "@/resources/session/session.controller";
import CourseController from "@/resources/course/course.controller";
import LessonController from "@/resources/lesson/lesson.controller";
import AcademyController from "@/resources/academy/academy.controller";

validateEnv();

const app = new App(
  [
    new UserController(),
    new SessionController(),
    new CourseController(),
    new LessonController(),
    new AcademyController(),
  ],
  Number(process.env.PORT)
);

app.listen();
