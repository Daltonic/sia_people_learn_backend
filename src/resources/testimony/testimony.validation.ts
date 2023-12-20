import { object, string, z } from "zod";

export const createTestimonySchema = object({
  body: object({
    statement: string({ required_error: "Statement is required" }),
    profession: string({ required_error: "Profession is required" }),
  }),
});

export const updateTestimonySchema = object({
  params: object({
    testimonyId: string({ required_error: "Testimony ID is required" }),
  }),
  body: object({
    statement: string().optional(),
    profession: string().optional(),
  }),
});

export const deleteTestimonySchema = object({
  params: object({
    testimonyId: string({ required_error: "Testimony ID is required" }),
  }),
});

export const approveTestimonySchema = object({
  params: object({
    testimonyId: string({ required_error: "Testimony ID is required" }),
  }),
});

export const fetchTestimoniesSchema = object({
  query: object({
    searchQuery: string().optional(),
    filter: z.enum(["newest", "oldest"]).optional(),
    page: string().optional(),
    pageSize: string().optional(),
    approved: z.enum(["true", "false"]).optional(),
  }),
});
