import { TypeOf } from "zod";
import { registerSchema } from "./user.validation";

export type RegisterInterface = TypeOf<typeof registerSchema>["body"];
