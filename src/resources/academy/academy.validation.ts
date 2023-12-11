import { number, object, string, z } from "zod";

export const createAcademySchema = object({
  body: object({
    name: string(),
    description: string(),
    overview: string(),
    imageUrl: string().optional(),
    price: number().positive(),
    validity: number().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    orderCount: number().optional(),
    highlights: string().array().optional(),
    whatToLearn: string().array().optional(),
    tags: string().array().optional(),
    courses: string().array().optional(),
  }),
});
