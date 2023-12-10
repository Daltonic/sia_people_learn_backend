import { TypeOf } from "zod";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  verifyUserSchema,
} from "@/resources/user/user.validation";

export type RegisterInterface = TypeOf<typeof registerSchema>["body"];
export type VerifyUserInterface = TypeOf<typeof verifyUserSchema>["query"];
export type ForgotPasswordInterface = TypeOf<
  typeof forgotPasswordSchema
>["body"];
export type ResetPasswordInterface = TypeOf<typeof resetPasswordSchema>;
export type UpdatePasswordInterface = TypeOf<
  typeof updatePasswordSchema
>["body"];
