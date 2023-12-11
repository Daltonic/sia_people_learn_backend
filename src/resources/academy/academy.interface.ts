import { TypeOf } from "zod";
import { createAcademySchema } from "@/resources/academy/academy.validation";

export type CreateAcademyInterface = TypeOf<typeof createAcademySchema>["body"];
