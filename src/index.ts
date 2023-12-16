import "dotenv/config";
import "module-alias/register";
import App from "./app";
import { validateEnv } from "@/utils/index";
import UserController from "@/resources/user/user.controller";
import SessionController from "@/resources/session/session.controller";
import CourseController from "@/resources/course/course.controller";
import LessonController from "@/resources/lesson/lesson.controller";
import AcademyController from "@/resources/academy/academy.controller";
import WishlistController from "@/resources/wishlist/wishlist.controller";
import PromoController from "@/resources/promo/promo.controllers";
import OrderController from "@/resources/order/order.controller";
import SubscriptionController from "@/resources/subscription/subscription.controller";
import ReviewController from "@/resources/review/review.controller";
import TestimonyController from "@/resources/testimony/testimony.controller";
import SiteSettingsController from "@/resources/settings/settings.controller";

validateEnv();

const app = new App(
  [
    new UserController(),
    new SessionController(),
    new CourseController(),
    new LessonController(),
    new AcademyController(),
    new WishlistController(),
    new PromoController(),
    new OrderController(),
    new SubscriptionController(),
    new ReviewController(),
    new TestimonyController(),
    new SiteSettingsController(),
  ],
  Number(process.env.PORT)
);

app.listen();
