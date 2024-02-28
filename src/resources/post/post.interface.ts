import { TypeOf } from "zod";
import {
  createPostSchema,
  deletePostSchema,
  fetchPostSchema,
  fetchPostsSchema,
  publishPostSchema,
  updatePostSchema,
} from "@/resources/post/post.validation";

export type CreatePostInterface = TypeOf<typeof createPostSchema>["body"];
export type UpdatePostInterface = TypeOf<typeof updatePostSchema>;
export type FetchPostInterface = TypeOf<typeof fetchPostSchema>["params"];
export type DeletePostInterface = TypeOf<typeof deletePostSchema>;
export type PublishPostInterface = TypeOf<typeof publishPostSchema>["params"];
export type FetchPostsInterface = TypeOf<typeof fetchPostsSchema>["query"];
