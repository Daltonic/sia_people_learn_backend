import {
  CreateReviewInterface,
  FetchReviewsInterface,
} from "@/resources/review/review.interface";
import log from "@/utils/logger";
import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import Academy from "@/resources/academy/academy.model";
import Review from "@/resources/review/review.model";
import { FilterQuery, Schema } from "mongoose";

class ReviewService {
  private userModel = User;
  private courseModel = Course;
  private academyModel = Academy;
  private reviewModel = Review;

  public async createReview(
    reviewInput: CreateReviewInterface,
    userId: string
  ): Promise<object | Error> {
    const { productId, productType, starRating, comment } = reviewInput;
    try {
      // Establish that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the product exist
      switch (productType) {
        case "Academy":
          const academy = await this.academyModel.findById(productId);
          if (!academy) {
            throw new Error("Academy not found");
          }
          if (!user.subscribedAcademies.includes(academy._id)) {
            throw new Error("User not subscribed to this Academy");
          }
          // If the user has already reviewed this academy, then return
          if (user.reviewedAcademies.includes(academy._id)) {
            return { success: "Already existing" };
            // throw new Error("User already reviewed this Academy");
          }
          break;
        case "Course":
          const course = await this.courseModel.findById(productId);
          if (!course) {
            throw new Error("Course not found");
          }

          if (!user.subscribedCourses?.includes(course._id)) {
            throw new Error("User not subscribed to this Course");
          }

          // If the user has already reviewed this course, then return
          if (user.reviewedCourses.includes(course._id)) {
            return { success: "Already existing" };
            // throw new Error("User already reviewed this Course");
          }
          break;
      }

      const review = await this.reviewModel.create({
        userId,
        productType,
        productId,
        starRating,
        comment,
        productModelType: productType,
      });

      // Save the product in the user's reviewedAcademy or reviewedCourse collection
      // if (productType === "Academy") {
      //   await this.userModel.findByIdAndUpdate(
      //     userId,
      //     { $push: { reviewedAcademies: productId } },
      //     { new: true }
      //   );

      //   await this.academyModel.findByIdAndUpdate(productId, {
      //     $push: { reviews: review._id },
      //     $inc: { reviewsCount: 1 },
      //   });
      // } else {
      //   await this.userModel.findByIdAndUpdate(userId, {
      //     $push: { reviewedCourses: productId },
      //   });

      //   await this.courseModel.findByIdAndUpdate(productId, {
      //     $push: { reviews: review._id },
      //     $inc: { reviewsCount: 1 },
      //   });
      // }

      return review;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Review");
    }
  }

  public async deleteReview(
    reviewId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Ensure that the review exists
      const review = await this.reviewModel.findById(reviewId);
      if (!review) {
        throw new Error("Review not found");
      }

      // Fetch the course or academy. That way we can ensure that current user is the course/academy instructor
      if (review.productType === "Academy") {
        const academy = await this.academyModel.findById(review.productId);
        if (!academy) {
          throw new Error("Academy not found");
        }

        if (userId !== String(academy.userId)) {
          throw new Error(
            "Only the academy instructor can delete reviews for this academy"
          );
        }
      } else {
        const course = await this.courseModel.findById(review.productId);
        if (!course) {
          throw new Error("Course not found");
        }

        if (userId !== String(course.userId)) {
          throw new Error(
            "Only the course instructor can delete reviews for this course"
          );
        }
      }

      // Now the review can be deleted
      review.deleted = true;
      await review.save();

      return "Review successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting review");
    }
  }

  public async fetchReviews(
    queryOptions: FetchReviewsInterface
  ): Promise<object | Error> {
    const { name, productType, approved, page, pageSize, filter } =
      queryOptions;
    try {
      const query: FilterQuery<typeof this.reviewModel> = {};

      // Add the productId and product type to the query
      query.name = name;
      query.productType = productType;

      // If the user specifies the approved field, then add that query
      if (approved) {
        query.approved = approved === "true";
      }

      // Sorting stratagy
      let sortingOptions = {};
      switch (filter) {
        case "newest":
          sortingOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortingOptions = { createdAt: 1 };
          break;
        default:
          sortingOptions = { createdAt: -1 };
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const reviews = await this.reviewModel
        .find(query)
        .select("starRating comment createdAt updatedAt approved")
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName imgUrl",
        })
        .populate({
          path: "productId",
          select: "_id name",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortingOptions);

      // Find out if there is a next page
      const totalReviews = await this.reviewModel.countDocuments(query);
      const isNext = totalReviews > skipAmount + reviews.length;
      const numOfPages = Math.ceil(totalReviews / numericPageSize);
      return { reviews, isNext, numOfPages };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching reviews");
    }
  }

  public async fetchUserReviews(userId: string): Promise<object | Error> {
    try {
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const reviews = await this.reviewModel.find({ userId });

      return reviews;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching reviews");
    }
  }

  public async approveReview(
    reviewId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Ensure that the review exists
      const review = await this.reviewModel.findById(reviewId);
      if (!review) {
        throw new Error("Review not found");
      }

      if (review.approved) {
        return "Review already approved";
      }

      // Get the productId and productType from the review so that we can check if the currentUser is the instructor
      if (review.productType === "Academy") {
        const academy = await this.academyModel.findById(review.productId);
        if (!academy) {
          throw new Error("Academy not found");
        }

        if (userId !== String(academy.userId)) {
          throw new Error(
            "Only the academy instructor can approve reviews for this academy"
          );
        }
      } else {
        const course = await this.courseModel.findById(review.productId);
        if (!course) {
          throw new Error("Course not found");
        }

        if (userId !== String(course.userId)) {
          throw new Error(
            "Only the course instructor can approve reviews for this course"
          );
        }
      }

      // Now approve the review
      review.approved = true;
      await review.save();

      // Update the Product with the averate rating and reviews count
      const updateData = await this.calculateAvarageRating(review.productId);

      await this.updateProductRating(
        updateData,
        review.productId,
        review.productType,
        reviewId
      );

      return "Rating has been successfully approved";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error approving Review");
    }
  }

  private async calculateAvarageRating(
    productId: Schema.Types.ObjectId
  ): Promise<{ _id: null; averageRating: number; reviewsCount: number }> {
    let result: { _id: null; averageRating: number; reviewsCount: number }[];

    try {
      result = await this.reviewModel.aggregate([
        { $match: { productId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$starRating" },
            reviewsCount: { $sum: 1 },
          },
        },
      ]);

      return result[0];
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error calculating average");
    }
  }

  private async updateProductRating(
    updateData: { _id: null; averageRating: number; reviewsCount: number },
    productId: Schema.Types.ObjectId,
    productType: "Course" | "Academy",
    reviewId: string
  ) {
    try {
      if (productType === "Academy") {
        await this.academyModel.findOneAndUpdate(
          { _id: productId },
          {
            rating: Math.ceil(updateData?.averageRating || 0),
            $push: { reviews: reviewId },
            reviewsCount: updateData.reviewsCount,
          }
        );
      } else {
        await this.courseModel.findOneAndUpdate(
          { _id: productId },
          {
            rating: Math.ceil(updateData?.averageRating || 0),
            $push: { reviews: reviewId },
            reviewsCount: updateData.reviewsCount,
          }
        );
      }
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating product Rating");
    }
  }
}

export default ReviewService;
