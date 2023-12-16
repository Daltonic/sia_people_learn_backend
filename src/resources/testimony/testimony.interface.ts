import { TypeOf } from "zod";
import {
  approveTestimonySchema,
  createTestimonySchema,
  deleteTestimonySchema,
  updateTestimonySchema,
} from "@/resources/testimony/testimony.validation";

export type CreateTestimonyInterface = TypeOf<
  typeof createTestimonySchema
>["body"];
export type UpdateTestimonyInterface = TypeOf<typeof updateTestimonySchema>;
export type ApproveTestimonyInterface = TypeOf<
  typeof approveTestimonySchema
>["params"];
export type DeleteTestimonyInterface = TypeOf<
  typeof deleteTestimonySchema
>["params"];
