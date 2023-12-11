import { TypeOf } from "zod";
import {
  createLessonSchema,
  deleteLessonSchema,
  fetchLessonSchema,
  updateLessonSchema,
} from "@/resources/lesson/lesson.validation";

export type CreateLessonInterface = TypeOf<typeof createLessonSchema>["body"];
export type UpdateLessonInterface = TypeOf<typeof updateLessonSchema>;
export type DeleteLessonInterface = TypeOf<typeof deleteLessonSchema>["params"];
export type FetchLessonInterface = TypeOf<typeof fetchLessonSchema>["params"];
