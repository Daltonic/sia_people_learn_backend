// Validation for all user payloads

import { object, string } from "zod";

export const registerSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(8, "Password must be a minimum of 8 characters"),
    imgUrl: string({}).optional(),
  }),
});
