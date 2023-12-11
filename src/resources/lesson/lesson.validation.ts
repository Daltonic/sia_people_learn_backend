import { number, object, string } from "zod";

export const createLessonSchema = object({
  body: object({
    courseId: string(),
    title: string(),
    overview: string(),
    description: string(),
    duration: number(),
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
  }),
  params: object({
    lessonId: string(),
  }),
});

export const deleteLessonSchema = object({
  params: object({
    lessonId: string(),
  }),
});

export const fetchLessonSchema = object({
  params: object({
    lessonId: string(),
  }),
});
