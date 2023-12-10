import { TypeOf } from "zod";
import {
  approveCourseSchema,
  createCourseSchema,
  deleteCourseSchema,
  fetchCourseSchema,
  submitCourseSchema,
  updateCourseSchema,
} from "@/resources/course/course.validation";

export type CreateCourseInterface = TypeOf<typeof createCourseSchema>["body"];
export type UpdateCourseInterface = TypeOf<typeof updateCourseSchema>;
export type DeleteCourseInterface = TypeOf<typeof deleteCourseSchema>["params"];
export type FetchCourseInterface = TypeOf<typeof fetchCourseSchema>["params"];
export type SubmitCourseInterface = TypeOf<typeof submitCourseSchema>;
export type ApproveCourseInterface = TypeOf<
  typeof approveCourseSchema
>["params"];
