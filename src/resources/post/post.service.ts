import User from "@/resources/user/user.model";
import {
  CreatePostInterface,
  FetchPostsInterface,
  UpdatePostInterface,
} from "@/resources/post/post.interface";
import Post, { IPost } from "@/resources/post/post.model";
import log from "@/utils/logger";
import { FilterQuery, Schema } from "mongoose";

class PostService {
  private postModel = Post;
  private userModel = User;

  public async createPost(
    postInput: CreatePostInterface,
    userId: string
  ): Promise<object | Error> {
    const { title, description, overview, imageUrl, parentId, category } =
      postInput;

    try {
      // Ensure that this is a valid user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If there is parentId, ensure that the Parent Post exists
      let parentPost: IPost | null = null;
      if (parentId) {
        parentPost = await this.postModel.findById(parentId);
        if (!parentPost) {
          throw new Error("Parent Post not found");
        }
      }

      // Create the post
      const post = await this.postModel.create({
        title,
        description,
        overview,
        userId,
        category: category.toUpperCase(),
        parentId: parentId || null,
        imageUrl: imageUrl || null,
        published: parentId ? true : false,
      });

      if (parentId) {
        await this.postModel.findByIdAndUpdate(
          parentId,
          {
            $push: { comments: post._id },
          },
          { new: true }
        );
      }

      return post;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Post");
    }
  }

  public async updatePost(
    postInput: UpdatePostInterface["body"],
    postId: string,
    userId: string
  ): Promise<object | Error> {
    const { title, overview, description, imageUrl, category } = postInput;

    try {
      if (!title && !overview && !description && !imageUrl && !category) {
        throw new Error("No data to update");
      }

      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the post exists
      const post = await this.postModel.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      // Ensure that current user is either the post creator or an admin
      if (user.userType !== "admin" && userId !== String(post.userId)) {
        throw new Error(
          "Only an admin or Post creator is permitted to update this post"
        );
      }

      const updatedPost = await this.postModel.findByIdAndUpdate(
        postId,
        {
          title: title || post.title,
          description: description || post.description,
          overview: overview || post.overview,
          imageUrl: imageUrl || post.imageUrl,
          category: category?.toUpperCase() || post.category,
        },
        { new: true }
      );

      return updatedPost!;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating Post");
    }
  }

  public async publishPost(
    postId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Ensure that this user is an admin
      const user = await this.userModel.findById(userId);
      if (!user || user.userType !== "admin") {
        throw new Error("You are not permitted to publish this post");
      }

      // Ensure that the post exists
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // If the post is already published, return;
      if (post.published) {
        return "Post already published";
      }

      // Now publish the post
      post.published = true;
      await post.save();

      await this.postModel.findByIdAndUpdate(
        post.parentId,
        {
          $push: { comments: post._id },
          $inc: { commentsCount: 1 },
        },
        { new: true }
      );

      return "Post has been successfully approved";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error approving Post");
    }
  }

  public async fetchPost(postId: string): Promise<object | Error> {
    try {
      // Ensure that the post exists
      const post = await this.postModel
        .findById(postId)
        .populate({
          path: "comments",
          model: this.postModel,
          select: "_id name description overview",
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName imgUrl",
        });
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Post");
    }
  }

  public async fetchUserPosts(
    userId: string,
    queryOptions: FetchPostsInterface
  ): Promise<object | Error> {
    const {
      searchQuery,
      filter,
      page,
      pageSize,
      parentsOnly,
      deleted,
      parentId,
      published,
      category,
    } = queryOptions;

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Design a filtering stratefy
      const query: FilterQuery<typeof this.postModel> = {};
      if (searchQuery) {
        query.$or = [
          { title: { $regex: new RegExp(searchQuery, "i") } },
          { overview: { $regex: new RegExp(searchQuery, "i") } },
          { description: { $regex: new RegExp(searchQuery, "i") } },
        ];
      }

      if (parentsOnly) {
        query.parentId = null;
      }

      if (parentId) {
        query.parentId = parentId;
      }

      if (published) {
        query.published = published;
      }

      if (category) {
        query.category = category.toUpperCase();
      }

      // Do not return deleted query
      query.deleted = false;

      query.userId = userId;

      // Define the sorting strategy
      let sortOptions = {};
      if (filter === "newest") {
        sortOptions = { createdAt: -1 };
      } else {
        sortOptions = { createdAt: 1 };
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const posts = await this.postModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName imgUrl",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions);

      const totalPosts = await this.postModel.countDocuments(query);
      const isNext = totalPosts > skipAmount + posts.length;
      const numOfPages = Math.ceil(totalPosts / numericPageSize);
      return { posts, isNext, numOfPages };
    } catch (e: any) {
      log.error(e);

      throw new Error(e.message || "Error fetching User's Posts");
    }
  }

  public async fetchPosts(
    queryOptions: FetchPostsInterface,
    userId: string
  ): Promise<object | Error> {
    const {
      searchQuery,
      filter,
      page,
      pageSize,
      parentsOnly,
      deleted,
      parentId,
      category,
      published,
    } = queryOptions;

    try {
      // Design a filtering stratefy
      const query: FilterQuery<typeof this.postModel> = {};
      if (searchQuery) {
        query.$or = [
          { title: { $regex: new RegExp(searchQuery, "i") } },
          { overview: { $regex: new RegExp(searchQuery, "i") } },
          { description: { $regex: new RegExp(searchQuery, "i") } },
        ];
      }

      if (parentsOnly) {
        query.parentId = null;
      }

      if (parentId) {
        query.parentId = parentId;
      }

      if (category) {
        query.category = category.toUpperCase();
      }

      // Non admins can only view published and non-deleted posts
      // Admin can view both published and unpublished posts. They can also view deleted posts and filter by deleted
      if (!userId) {
        query.published = true;
        query.deleted = false;
      } else {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        if (user.userType !== "admin") {
          query.published = true;
          query.deleted = false;
        } else {
          if (deleted) {
            query.deleted = deleted === "true";
          }
          if (published) {
            query.published = published === "true";
          }
        }
      }

      // Define the sorting strategy
      let sortOptions = {};
      switch (filter) {
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 5; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const posts = await this.postModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName imgUrl",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions);

      const totalPosts = await this.postModel.countDocuments(query);
      const isNext = totalPosts > skipAmount + posts.length;
      const numOfPages = Math.ceil(totalPosts / numericPageSize);

      return { posts, isNext, numOfPages };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Posts");
    }
  }

  public async deletePost(
    postId: string,
    userId: string,
    deleteWithChildren?: "true" | "false"
  ): Promise<string | Error> {
    try {
      // Ensure that the post exists
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that this is either an admin or the post creator
      if (userId !== String(post.userId)) {
        throw new Error("You are not permitted to delete this Post");
      }

      if (deleteWithChildren && deleteWithChildren === "true") {
        post.comments.map(
          async (comment: Schema.Types.ObjectId) =>
            await this.postModel.findByIdAndUpdate(
              comment,
              { deleted: true },
              { new: true }
            )
        );
      } else {
        post.comments.map(
          async (comment: Schema.Types.ObjectId) =>
            await this.postModel.findByIdAndUpdate(
              comment,
              {
                parentId: null,
              },
              { new: true }
            )
        );
      }

      await this.postModel.findByIdAndUpdate(
        postId,
        { deleted: true },
        { new: true }
      );

      return "Post has been successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Post");
    }
  }
}

export default PostService;
