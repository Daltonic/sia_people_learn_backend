import { TypeOf } from "zod";
import { loginSchema } from "./session.validation";

export type LoginInterface = TypeOf<typeof loginSchema>["body"];
