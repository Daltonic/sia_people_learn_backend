import Academy from "@/resources/academy/academy.model";
import Course from "@/resources/course/course.model";
import Order from "@/resources/order/order.model";
import User from "@/resources/user/user.model";
import Subscription from "@/resources/subscription/subscription.model";
import { CreateSubscriptionInterface } from "@/resources/subscription/subscription.interface";
import log from "@/utils/logger";

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
    const {
      orderId,
      paymentFrequency,
      paymentFrequencyType,
      productId,
      productType,
    } = subscriptionInput;
    try {
      // Ensure that this is a valid user;
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the order exists
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      let expiresAt: Date;

      if (paymentFrequencyType === "Month") {
        expiresAt = new Date(
          Date.now() + paymentFrequency * 30 * 24 * 60 * 60 * 1000
        );
      } else {
        expiresAt = new Date(
          Date.now() + paymentFrequency * 365 * 24 * 60 * 60 * 1000
        );
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
        orderId,
        paymentFrequency,
        paymentFrequencyType,
        productType,
        productId,
        expiresAt,
        amount: order.grandTotal,
        productModelType: productType,
      });

      return subscription;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Subscription");
    }
  }

  public async fetchSubscriptions(): Promise<object | Error> {
    try {
      const subscriptions = await this.subscriptionModel
        .find({})
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id firstName lastName username",
        })
        .populate({
          path: "productId",
          select: "_id name difficulty overview description",
        })
        .populate({
          path: "orderId",
          model: this.orderModel,
          select: "orderCode transactionRef paymentType",
        });

      return subscriptions;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching subscriptions");
    }
  }

  public async fetchUserSubscriptions(userId: string): Promise<object | Error> {
    try {
      // Ensure that this is a valid user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get the user's subscriptions
      const subscriptions = await this.subscriptionModel
        .find({ userId: user._id })
        .populate({
          path: "productId",
          select: "_id name overview description diffulty",
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName",
        })
        .populate({
          path: "orderId",
          model: this.orderModel,
          select: "_id orderCode",
        });

      return subscriptions;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching user's subscriptions");
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
      if (user.userType !== "admin" && String(subscription.userId) !== userId) {
        throw new Error("User not permitted to delete this subscription");
      }

      await this.subscriptionModel.findByIdAndDelete(subscriptionId);

      return "Subscription successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Subscription");
    }
  }
}

export default SubscriptionService;
