import Promo from "@/resources/promo/promo.model";
import User from "@/resources/user/user.model";
import {
  CreateOrderInterface,
  FetchOrdersInterface,
} from "@/resources/order/order.interface";
import Order from "@/resources/order/order.model";
import log from "@/utils/logger";
import { FilterQuery, Schema } from "mongoose";

class OrderService {
  private userModel = User;
  private promoModel = Promo;
  private orderModel = Order;

  public async createOrder(
    orderInput: CreateOrderInterface,
    userId: string
  ): Promise<object | Error> {
    const { promoId, total, transactionRef, paymentType, grandTotal } =
      orderInput;
    try {
      // Verify that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If there is a promoId, then verify that promo exists
      if (promoId) {
        const promo = await this.promoModel.findById(promoId);
        if (!promo) {
          throw new Error("Promo not found");
        }

        // Verify that the grandTotal is properly computed
        const computedGrandTotal =
          total * (1 - Number(promo.percentage) * 0.01);
        if (computedGrandTotal !== grandTotal) {
          log.info("Computed grandTotal is different from provided grandTotal");
        }
      }

      const order = await this.orderModel.create({
        userId,
        total,
        transactionRef,
        paymentType,
        grandTotal,
        promoId: promoId || null,
      });

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

      if (user.userType !== "admin") {
        query.userId = userId;
      }

      if (paymentType) {
        query.paymentType = paymentType;
      }

      if (hasPromoCode && hasPromoCode === "true") {
        query.promoId = { $ne: null };
      }

      if (hasPromoCode && hasPromoCode === "false") {
        query.promoId = { $eq: null };
      }

      console.log(query);

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
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort({ createdAt: -1 });

      // Find out if there is a next page
      const totalOrders = await this.orderModel.countDocuments(query);
      const isNext = totalOrders > skipAmount + orders.length;
      return { orders, isNext };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching orders");
    }
  }
}

export default OrderService;
