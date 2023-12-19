import { boolean, object, string, z } from "zod";

export const createPostSchema = object({
  body: object({
    name: string(),
    description: string(),
    overview: string(),
    imageUrl: string().optional(),
    parentId: string().optional(),
  }),
});

export const updatePostSchema = object({
  body: object({
    name: string().optional(),
    description: string().optional(),
    overview: string().optional(),
    imageUrl: string().optional(),
  }),
  params: object({
    postId: string(),
  }),
});

export const fetchPostSchema = object({
  params: object({
    postId: string(),
  }),
});

export const fetchPostsSchema = object({
  query: object({
    parentsOnly: z.enum(["true", "false"]).optional(),
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "recommended"]).default("newest"),
  }),
});

export const deletePostSchema = object({
  params: object({
    postId: string(),
  }),
  query: object({
    deleteWithChildren: z.enum(["true", "false"]),
  }),
});

export const publishPostSchema = object({
  params: object({
    postId: string(),
  }),
});
