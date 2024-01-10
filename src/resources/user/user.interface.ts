import { TypeOf } from "zod";
import {
  downgradeUserSchema,
  fetchUsersSchema,
  forgotPasswordSchema,
  registerSchema,
  requestUserUpgradeSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  upgradeUserSchema,
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
export type UpgradeUserInterface = TypeOf<typeof upgradeUserSchema>["body"];
export type DowngradeUserInterface = TypeOf<typeof downgradeUserSchema>["body"];
export type RequestUserUpgradeInterface = TypeOf<
  typeof requestUserUpgradeSchema
>["body"];
export type fetchUsersInterface = TypeOf<typeof fetchUsersSchema>["query"];
