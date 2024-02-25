import { number, object, string } from "zod";

export const createLessonSchema = object({
  body: object({
    courseId: string({ required_error: "Course ID is required" }),
    title: string({ required_error: "Lesson title is required" }),
    description: string({ required_error: "Lesson description is required" }),
    duration: number({ required_error: "Lesson duration is required" }),
    overview: string().optional(),
    imageUrl: string().optional(),
    videoUrl: string().optional(),
    downloadableUrl: string().optional(),
    order: number().optional(),
  }),
});

export const updateLessonSchema = object({
  body: object({
    title: string().optional(),
    overview: string().optional(),
    description: string().optional(),
    duration: number().optional(),
    imageUrl: string().optional(),
    videoUrl: string().optional(),
    downloadableUrl: string().optional(),
    order: number().optional(),
  }),
  params: object({
    lessonId: string({ required_error: "Lesson ID is required" }),
  }),
});

export const deleteLessonSchema = object({
  params: object({
    lessonId: string({ required_error: "Lesson ID is required" }),
  }),
});

export const fetchLessonSchema = object({
  params: object({
    lessonId: string({ required_error: "Lesson ID is required" }),
  }),
  query: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
});

export const fetchLessonsSchema = object({
  query: object({
    courseId: string({ required_error: "Course ID is required" }),
  }),
});
