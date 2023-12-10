import { boolean, number, object, string, z } from "zod";

export const createCourseSchema = object({
  body: object({
    name: string(),
    price: number(),
    description: string(),
    overview: string(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    tags: string().array().optional(),
    imageUrl: string().optional(),
  }),
});

export const updateCourseSchema = object({
  body: object({
    name: string().optional(),
    price: number().optional(),
    description: string().optional(),
    overview: string().optional(),
    imageUrl: string().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    tags: string().array().optional(),
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
