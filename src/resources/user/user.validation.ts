// Validation for all user payloads

import { object, string, z } from "zod";

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

export const upgradeUserSchema = object({
  body: object({
    userId: string({ required_error: "User ID is required" }),
    upgradeUserTo: z.enum(["instructor", "admin"], {
      required_error: "UpgradeUserTo is required",
    }),
    requestId: string({ required_error: "Request Id is required" }),
    status: z.enum(["approved", "rejected"], {
      required_error: "Request status is required",
    }),
  }),
});

export const downgradeUserSchema = object({
  body: object({
    userId: string({ required_error: "User Id is required" }),
    downgradeUserTo: z.enum(["instructor", "user"], {
      required_error: "downgradeUserTo is required",
    }),
  }),
});

export const requestUserUpgradeSchema = object({
  body: object({
    upgradeUserTo: z.enum(["instructor", "admin"]),
    specialty: string({ required_error: "Specialty is required" }),
    linkedInProfile: string({ required_error: "LinkedIn profile required" }),
    tutorialTitle: string({ required_error: "Tutorial title is required" }),
    samplesLink: string({ required_error: "Samples tutorial link required" }),
  }),
});

export const fetchUsersSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "oldest"]).optional(),
    userType: z.enum(["admin", "instructor", "user"]).optional(),
  }),
});
