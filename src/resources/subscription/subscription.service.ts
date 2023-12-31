import Academy from "@/resources/academy/academy.model";
import Course from "@/resources/course/course.model";
import Order, { IOrder } from "@/resources/order/order.model";
import User from "@/resources/user/user.model";
import Subscription from "@/resources/subscription/subscription.model";
import {
  CreateSubscriptionInterface,
  FetchSubscriptionsInterface,
} from "@/resources/subscription/subscription.interface";
import log from "@/utils/logger";
import { FilterQuery } from "mongoose";

class SubscriptionService {
  private userModel = User;
  private courseModel = Course;
  private academyModel = Academy;
  private orderModel = Order;
  private subscriptionModel = Subscription;

  public async createSubscription(
    subscriptionInput: CreateSubscriptionInterface,
    userId: string
  ): Promise<object | Error> {
    const { orderId, paymentFrequency, productId, productType } =
      subscriptionInput;
    try {
      // Ensure that this is a valid user;
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If orderId is provided, then ensure that the order exists
      let order: IOrder | null = null;
      if (orderId) {
        order = await this.orderModel.findById(orderId);
        if (!order) {
          throw new Error("Order not found");
        }
      }
      let expiresAt: Date;

      if (paymentFrequency === "Month") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (paymentFrequency === "Year") {
        expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      } else {
        // Expired 100 years from now
        expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
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

      const subscription = await this.subscriptionModel.create({
        userId,
        orderId: orderId || null,
        paymentFrequency: paymentFrequency,
        productType: productType,
        productId,
        expiresAt,
        amount: order ? order.grandTotal : 0,
        productModelType: productType,
      });

      // Save the product in the user's academy or course collection
      if (productType === "Academy") {
        await this.userModel.findByIdAndUpdate(
          userId,
          { $push: { academies: productId } },
          { new: true }
        );
      } else {
        await this.userModel.findByIdAndUpdate(userId, {
          $push: { courses: productId },
        });
      }

      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { subscriptions: subscription._id } },
        { new: true }
      );

      return subscription;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Subscription");
    }
  }

  public async fetchSubscriptions(
    userId: string,
    queryOptions: FetchSubscriptionsInterface
  ): Promise<object | Error> {
    const { page, pageSize, filter, productType, status } = queryOptions;
    try {
      // Ensure that this is a valid user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Design the filtering strategy
      const query: FilterQuery<typeof this.subscriptionModel> = {};
      if (user.userType !== "admin") {
        query.userId = userId;
      }

      if (productType) {
        query.productType = productType;
      }

      if (status) {
        query.status = status;
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
        case "recommended":
          //todo: Decide on a recommendation algorithm
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const subscriptions = await this.subscriptionModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id firstName lastName username",
        })
        .populate({
          path: "productId",
          select: "_id name difficulty overview description type",
        })
        .populate({
          path: "orderId",
          model: this.orderModel,
          select: "orderCode transactionRef paymentType",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions);

      const totalSubscriptions =
        await this.subscriptionModel.countDocuments(query);
      const isNext = totalSubscriptions > skipAmount + subscriptions.length;

      // Compute page size
      const numOfPages = Math.ceil(totalSubscriptions / numericPageSize);
      return { subscriptions, isNext, numOfPages };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching subscriptions");
    }
  }

  public async deleteSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Ascertain that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ascertain that the subscription exists
      const subscription =
        await this.subscriptionModel.findById(subscriptionId);

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Ensure that current user is the subscription holder or an admin
      if (String(subscription.userId) !== userId) {
        throw new Error("User not permitted to delete this subscription");
      }

      if (subscription.status === "Completed") {
        throw new Error(
          "This order has been completed and can no longer be deleted"
        );
      }

      if (subscription.productModelType === "Academy") {
        await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $pull: { academies: subscription.productId } },
          { new: true }
        );
      } else {
        await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $pull: { courses: subscription.productId } },
          { new: true }
        );
      }

      await this.subscriptionModel.findByIdAndDelete(subscriptionId);

      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { subscriptions: subscription._id } },
        { new: true }
      );

      return "Subscription successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Subscription");
    }
  }
}

export default SubscriptionService;
