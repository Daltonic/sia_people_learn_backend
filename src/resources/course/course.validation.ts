import { boolean, number, object, string, z } from "zod";

export const createCourseSchema = object({
  body: object({
    name: string({ required_error: "Course Name is required" }),
    price: number({ required_error: "Course Price is required" }).positive(),
    description: string({ required_error: "Course Description is required" }),
    overview: string({ required_error: "Course Overview is required" }),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    type: z.enum(["Course", "Book"], { required_error: "type is required" }),
    tags: string().array().optional(),
    imageUrl: string().optional(),
    requirements: string().array().optional(),
    highlights: string().array().optional(),
  }),
});

export const updateCourseSchema = object({
  body: object({
    type: z.enum(["Course", "Book"], {
      required_error: "Course type is required",
    }),
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
    courseId: string({ required_error: "Course ID is required" }),
  }),
});

export const deleteCourseSchema = object({
  params: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
});

export const fetchCourseSchema = object({
  params: object({
    slug: string({ required_error: "Slug is required" }),
  }),
});

export const submitCourseSchema = object({
  params: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
  body: object({
    submitted: boolean({ required_error: "Submitted state is required" }),
  }),
});

export const approveCourseSchema = object({
  params: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
});

export const fetchCoursesSchema = object({
  query: object({
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "oldest", "recommended"]).optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    deleted: z.enum(["true", "false"]).optional(),
    instructor: z.enum(["true", "false"]).optional(),
    approved: z.enum(["true", "false"]).optional(),
    type: z.enum(["Course", "Book"]).optional(),
  }),
});

export const orderLessonsSchema = object({
  body: object({
    lessonsIds: string({ required_error: "Lesson IDs are required" }).array(),
  }),
  params: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
});
