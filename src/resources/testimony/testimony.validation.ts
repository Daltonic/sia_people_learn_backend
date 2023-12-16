import { object, string } from "zod";

export const createTestimonySchema = object({
  body: object({
    statement: string(),
    profession: string(),
  }),
});

export const updateTestimonySchema = object({
  params: object({
    testimonyId: string(),
  }),
  body: object({
    statement: string().optional(),
    profession: string().optional(),
  }),
});

export const deleteTestimonySchema = object({
  params: object({
    testimonyId: string(),
  }),
});

export const approveTestimonySchema = object({
  params: object({
    testimonyId: string(),
  }),
});
