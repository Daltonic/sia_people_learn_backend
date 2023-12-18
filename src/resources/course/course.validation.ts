import { boolean, number, object, string, z } from "zod";

export const createCourseSchema = object({
  body: object({
    name: string(),
    price: number().positive(),
    description: string(),
    overview: string(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    tags: string().array().optional(),
    imageUrl: string().optional(),
    requirements: string().array(),
    highlights: string().array(),
  }),
});

export const updateCourseSchema = object({
  body: object({
    name: string().optional(),
    price: number().positive().optional(),
    description: string().optional(),
    overview: string().optional(),
    imageUrl: string().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    tags: string().array().optional(),
    requirements: string().array().optional(),
    highlights: string().array().optional(),
  }),
  params: object({
    courseId: string(),
  }),
});

export const deleteCourseSchema = object({
  params: object({
    courseId: string(),
  }),
});

export const fetchCourseSchema = object({
  params: object({
    courseId: string(),
  }),
});

export const submitCourseSchema = object({
  params: object({
    courseId: string(),
  }),
  body: object({
    submitted: boolean(),
  }),
});

export const approveCourseSchema = object({
  params: object({
    courseId: string(),
  }),
});

export const fetchCoursesSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "recommended"]).default("newest"),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    approvedOnly: z.enum(["true", "false"]).default("false"),
  }),
});
