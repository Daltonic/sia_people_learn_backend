import Promo from "@/resources/promo/promo.model";
import User from "@/resources/user/user.model";
import {
  CreateOrderInterface,
  FetchOrdersInterface,
} from "@/resources/order/order.interface";
import Order from "@/resources/order/order.model";
import log from "@/utils/logger";
import { FilterQuery, Schema } from "mongoose";
import Subscription from "@/resources/subscription/subscription.model";

class OrderService {
  private userModel = User;
  private promoModel = Promo;
  private orderModel = Order;
  private subscriptionModel = Subscription;

  public async createOrder(
    orderInput: CreateOrderInterface
  ): Promise<object | Error> {
    const { promoId, transactionRef, paymentType, subscriptions, userId } =
      orderInput;
    try {
      // Verify that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const subscriptionsIds: string[] = [];
      const subscribedCourses: string[] = [];
      const subscribedAcademies: string[] = [];

      let computedTotal = 0;

      for (const sub of subscriptions) {
        const subscription = await this.subscriptionModel.findById(sub);
        if (!subscription) {
          throw new Error(`Subscription with ID: ${sub} does not exist`);
        }

        if (String(subscription.userId) !== userId) {
          throw new Error(
            `Subscription with ID: ${sub} does not belong to current user`
          );
        }

        if (subscription.status === "Completed") {
          throw new Error(`User already subscribed to ${sub}`);
        }

        if (subscription?.productType === "Academy") {
          subscribedAcademies.push(String(subscription.productId));
        }

        if (subscription?.productType === "Course") {
          subscribedCourses.push(String(subscription.productId));
        }

        subscriptionsIds.push(subscription._id);
        computedTotal += subscription.amount;
      }

      let grandTotal = computedTotal;

      // If there is a promoId, then verify that promo exists
      if (promoId) {
        const promo = await this.promoModel.findById(promoId);
        if (!promo) {
          throw new Error("Promo not found");
        }

        // Verify that the grandTotal is properly computed
        grandTotal = computedTotal * (1 - Number(promo.percentage) * 0.01);
      }

      const order = await this.orderModel.create({
        userId,
        total: computedTotal,
        transactionRef,
        paymentType,
        grandTotal,
        promoId: promoId || null,
        subscriptions: subscriptionsIds,
      });

      // Update the subscriptions
      subscriptions.map(async (sub) => {
        await this.subscriptionModel.findByIdAndUpdate(
          sub,
          { orderId: order._id, status: "Completed" },
          { new: true }
        );
      });

      // Update the subscribed courses and academies in the user model
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            subscribedAcademies: { $each: subscribedAcademies },
            subscribedCourses: { $each: subscribedCourses },
          },
        },
        { new: true }
      );

      return order;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Order");
    }
  }

  public async fetchOrder(
    orderId: string,
    userId: string
  ): Promise<object | Error> {
    try {
      // Ensure that the userId is valid;
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the order exists
      const order = await this.orderModel
        .findById(orderId)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id firstName lastName username",
        })
        .populate({
          path: "promoId",
          model: this.promoModel,
          select: "code percentage promoType",
        })
        .populate({
          path: "subscriptions",
          model: this.subscriptionModel,
          select: "productId productType status",
        });
      if (!order) {
        throw new Error("Order not found");
      }

      const userProps = order.userId as any as {
        _id: Schema.Types.ObjectId;
        firstName: string;
        lastName: string;
        username: string;
      };

      // The user must either be the order owner or an admin
      if (user.userType !== "admin" && String(userProps._id) !== userId) {
        throw new Error("User is not allowed to access this route");
      }

      return order;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Order");
    }
  }

  public async fetchOrders(
    queryOptions: FetchOrdersInterface,
    userId: string
  ): Promise<object | Error> {
    const { page, pageSize, hasPromoCode, paymentType } = queryOptions;
    try {
      const query: FilterQuery<typeof this.orderModel> = {};
      // Find out who the current user to determine whether to display all others or just the user's orders
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If current user is not an admin, then display only the current user's orders
      if (user.userType !== "admin") {
        query.userId = userId;
      }

      // If the user specifies a payment type, then query by that payment type
      if (paymentType) {
        query.paymentType = paymentType;
      }

      // If the user specifies to fetch only orders with promocode, then return orders whose promoId is not null
      if (hasPromoCode && hasPromoCode === "true") {
        query.promoId = { $ne: null };
      }

      // If the user specifies to fetch only orders without promoCode, then return orders where promoId is null
      if (hasPromoCode && hasPromoCode === "false") {
        query.promoId = { $eq: null };
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const orders = await this.orderModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id firstName lastName username",
        })
        .populate({
          path: "promoId",
          model: this.promoModel,
          select: "code percentage promoType",
        })
        .populate({
          path: "subscriptions",
          model: this.subscriptionModel,
          select: "productId productType status",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort({ createdAt: -1 });

      // Find out if there is a next page
      const totalOrders = await this.orderModel.countDocuments(query);
      const isNext = totalOrders > skipAmount + orders.length;
      const numOfPages = Math.ceil(totalOrders / numericPageSize);
      return { orders, isNext, numOfPages };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching orders");
    }
  }
}

export default OrderService;
