import { number, object, string, z } from "zod";

export const createAcademySchema = object({
  body: object({
    name: string({ required_error: "Academy Name is required." }),
    description: string({ required_error: "Academy Description is required." }),
    overview: string({ required_error: "Academy overview is required." }),
    imageUrl: string().optional(),
    price: number({ required_error: "Academy price is required." }).positive(),
    validity: number().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    orderCount: number().optional(),
    requirements: string({
      required_error: "Course Requirements is required",
    }).array(),
    highlights: string({
      required_error: "Course Highlights is required",
    }).array(),
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
    requirements: string().array().optional(),
    tags: string().array().optional(),
    courses: string().array().optional(),
  }),
  params: object({
    academyId: string({ required_error: "Academy ID is required." }),
  }),
});

export const fetchAcademySchema = object({
  params: object({
    academyId: string({ required_error: "Academy ID is required." }),
  }),
});

export const deleteAcademySchema = object({
  params: object({
    academyId: string({ required_error: "Academy ID is required." }),
  }),
});

export const submitAcademySchema = object({
  params: object({
    academyId: string({ required_error: "Academy ID is required" }),
  }),
});

export const approveAcademySchema = object({
  params: object({
    academyId: string({ required_error: "Academy ID is required" }),
  }),
});

export const fetchAcademiesSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "oldest", "recommended"]).optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    deleted: z.enum(["true", "false"]).optional(),
  }),
});
