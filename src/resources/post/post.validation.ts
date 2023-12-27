import { object, string, z } from "zod";

export const createPostSchema = object({
  body: object({
    name: string({ required_error: "Post Name is required" }),
    description: string({ required_error: "Post Description is required" }),
    overview: string({ required_error: "Post Overview is required" }),
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
    postId: string({ required_error: "Post ID is required" }),
  }),
});

export const fetchPostSchema = object({
  params: object({
    postId: string({ required_error: "Post ID is required" }),
  }),
});

export const fetchPostsSchema = object({
  query: object({
    parentsOnly: z.enum(["true", "false"]).optional(),
    page: string().optional(),
    pageSize: string().optional(),
    searchQuery: string().optional(),
    filter: z.enum(["newest", "oldest", "recommended"]).optional(),
    deleted: z.enum(["true", "false"]).optional(),
    parentId: string().optional(),
  }),
});

export const deletePostSchema = object({
  params: object({
    postId: string({ required_error: "Post ID is required" }),
  }),
  query: object({
    deleteWithChildren: z.enum(["true", "false"]).optional(),
  }),
});

export const publishPostSchema = object({
  params: object({
    postId: string({ required_error: "Post ID is required" }),
  }),
});
