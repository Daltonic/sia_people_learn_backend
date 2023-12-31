import { TypeOf } from "zod";
import {
  addCourseSchema,
  approveAcademySchema,
  createAcademySchema,
  deleteAcademySchema,
  fetchAcademiesSchema,
  fetchAcademySchema,
  removeCourseSchema,
  submitAcademySchema,
  updateAcademySchema,
} from "@/resources/academy/academy.validation";

export type CreateAcademyInterface = TypeOf<typeof createAcademySchema>["body"];
export type UpdateAcademyInterface = TypeOf<typeof updateAcademySchema>;
export type FetchAcademyInterface = TypeOf<typeof fetchAcademySchema>["params"];
export type DeleteAcademyInterface = TypeOf<
  typeof deleteAcademySchema
>["params"];
export type SubmitAcademyInterface = TypeOf<
  typeof submitAcademySchema
>["params"];
export type ApproveAcademyInterface = TypeOf<
  typeof approveAcademySchema
>["params"];
export type FetchAcademiesInterface = TypeOf<
  typeof fetchAcademiesSchema
>["query"];

export type AddCourseInterface = TypeOf<typeof addCourseSchema>["query"];
export type RemoveCourseInterface = TypeOf<typeof removeCourseSchema>["query"];
