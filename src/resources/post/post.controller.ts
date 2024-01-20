import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import PostService from "@/resources/post/post.service";
import {
  CreatePostInterface,
  DeletePostInterface,
  FetchPostInterface,
  FetchPostsInterface,
  PublishPostInterface,
  UpdatePostInterface,
} from "@/resources/post/post.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { loggedIn, validateResource } from "@/middlewares/index";
import {
  createPostSchema,
  deletePostSchema,
  fetchPostSchema,
  fetchPostsSchema,
  publishPostSchema,
  updatePostSchema,
} from "@/resources/post/post.validation";

class PostController implements Controller {
  public path = "/posts";
  public router = Router();
  private postService = new PostService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [loggedIn, validateResource(createPostSchema)],
      this.createPost
    );

    this.router.put(
      `${this.path}/update/:postId`,
      [loggedIn, validateResource(updatePostSchema)],
      this.updatePost
    );

    this.router.get(
      `${this.path}/:postId`,
      validateResource(fetchPostSchema),
      this.fetchPost
    );

    this.router.put(
      `${this.path}/publish/:postId`,
      [loggedIn, validateResource(publishPostSchema)],
      this.publishPost
    );

    this.router.get(`${this.path}/user/posts`, [loggedIn], this.fetchUserPosts);

    this.router.get(
      `${this.path}`,
      validateResource(fetchPostsSchema),
      this.fetchPosts
    );

    this.router.delete(
      `${this.path}/delete/:postId`,
      [loggedIn, validateResource(deletePostSchema)],
      this.deletePost
    );
  }

  private createPost = async (
    req: Request<{}, {}, CreatePostInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const postInput = req.body;
    const { _id: userId } = res.locals.user;
    try {
      const post = await this.postService.createPost(postInput, userId);
      res.status(StatusCodes.CREATED).json(post);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private updatePost = async (
    req: Request<
      UpdatePostInterface["params"],
      {},
      UpdatePostInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    const postInput = req.body;
    const { postId } = req.params;

    try {
      const post = await this.postService.updatePost(postInput, postId, userId);
      res.status(StatusCodes.OK).json(post);
    } catch (e: any) {
      if (e.message === "You are not permitted to update this Post") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };

  private fetchPost = async (
    req: Request<FetchPostInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;

    try {
      const post = await this.postService.fetchPost(postId);
      res.status(StatusCodes.OK).json(post);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private publishPost = async (
    req: Request<PublishPostInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const { _id: userId } = res.locals.user;
    try {
      const message = await this.postService.publishPost(postId, userId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchUserPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;

    try {
      const posts = await this.postService.fetchUserPosts(userId);
      res.status(StatusCodes.OK).json(posts);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchPosts = async (
    req: Request<{}, {}, {}, FetchPostsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const queryOptions = req.query;
    const userId = res.locals?.user?._id;
    try {
      const posts = await this.postService.fetchPosts(queryOptions, userId);
      res.status(StatusCodes.OK).json(posts);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private deletePost = async (
    req: Request<
      DeletePostInterface["params"],
      {},
      {},
      DeletePostInterface["query"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.postService.deletePost(
        postId,
        userId,
        req.query?.deleteWithChildren
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      if (e.message === "You are not permitted to delete this Post") {
        next(new HttpException(StatusCodes.UNAUTHORIZED, e.message));
      } else {
        next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
      }
    }
  };
}

export default PostController;
