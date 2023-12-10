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

export const verifyUserSchema = object({
  query: object({
    verificationCode: string({
      required_error: "Verification code is required",
    }),
    userId: string({
      required_error: "User ID is required",
    }),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Invalid email provided"),
  }),
});

export const resetPasswordSchema = object({
  query: object({
    passwordResetCode: string({
      required_error: "Password Reset Code is required",
    }),
    userId: string({
      required_error: "User ID is required",
    }),
  }),
  body: object({
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export const updatePasswordSchema = object({
  body: object({
    currentPassword: string({
      required_error: "Current Password is required",
    }),
    newPassword: string({
      required_error: "New Password is required",
    }),
  }),
});
