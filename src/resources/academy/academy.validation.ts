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

export const updateAcademySchema = object({
  body: object({
    name: string().optional(),
    description: string().optional(),
    overview: string().optional(),
    imageUrl: string().optional(),
    price: number().optional(),
    validity: number().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    orderCount: number().optional(),
    highlights: string().array().optional(),
    whatToLearn: string().array().optional(),
    tags: string().array().optional(),
    courses: string().array().optional(),
  }),
  params: object({
    academyId: string(),
  }),
});

export const fetchAcademySchema = object({
  params: object({
    academyId: string(),
  }),
});

export const deleteAcademySchema = object({
  params: object({
    academyId: string(),
  }),
});

export const submitAcademySchema = object({
  params: object({
    academyId: string(),
  }),
});

export const approveAcademySchema = object({
  params: object({
    academyId: string(),
  }),
});

export const fetchAcademiesSchema = object({
  query: object({
    page: number().optional(),
    pageSize: number().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "recommended"]).default("newest"),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    approvedOnly: z.enum(["true", "false"]).default("false"),
    rating: number().min(1).max(5).optional(),
  }),
});
