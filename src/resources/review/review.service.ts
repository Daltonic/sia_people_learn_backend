import { CreateReviewInterface } from "@/resources/review/review.interface";
import log from "@/utils/logger";
import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import Academy from "@/resources/academy/academy.model";
import Review from "@/resources/review/review.model";
import { Schema } from "mongoose";

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
          break;
        case "Course":
          const course = await this.courseModel.findById(productId);
          if (!course) {
            throw new Error("Course not found");
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
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the review exists
      const review = await this.reviewModel.findById(reviewId);
      if (!review) {
        throw new Error("Review not found");
      }

      // Only admin or the user that created the review should delete this review
      if (user.userType !== "admin" && String(review.userId) !== userId) {
        throw new Error("You are not permitted to delete this Review");
      }

      // Now the review can be deleted
      await this.reviewModel.findByIdAndDelete(reviewId);

      // Update the product rating to reflect the deletion of this rating
      const updatedData = await this.calculateAvarageRating(review.productId);
      await this.updateProductRating(
        updatedData,
        review.productId,
        review.productType
      );

      return "Review successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting review");
    }
  }

  public async fetchReviews(): Promise<object | Error> {
    try {
      const reviews = await this.reviewModel
        .find({})
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName",
        })
        .populate({
          path: "productId",
          select: "_id name difficulty overview description",
        });

      return reviews;
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

  public async approveReview(reviewId: string): Promise<string | Error> {
    try {
      // Ensure that the review exists
      const review = await this.reviewModel.findById(reviewId);
      if (!review) {
        throw new Error("Review not found");
      }

      if (review.approved) {
        return "Review already approved";
      }

      // Now approve the review
      review.approved = true;
      await review.save();

      // Update the Product with the averate rating and reviews count
      const updateData = await this.calculateAvarageRating(review.productId);

      await this.updateProductRating(
        updateData,
        review.productId,
        review.productType
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
    productType: "Course" | "Academy"
  ) {
    try {
      if (productType === "Academy") {
        await this.academyModel.findOneAndUpdate(
          { _id: productId },
          {
            rating: Math.ceil(updateData?.averageRating || 0),
            reviewsCount: updateData?.reviewsCount || 0,
          }
        );
      } else {
        await this.courseModel.findOneAndUpdate(
          { _id: productId },
          {
            rating: Math.ceil(updateData?.averageRating || 0),
            reviewsCount: updateData?.reviewsCount || 0,
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
