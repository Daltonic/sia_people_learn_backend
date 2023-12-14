import Promo from "@/resources/promo/promo.model";
import User from "@/resources/user/user.model";
import { CreateOrderInterface } from "@/resources/order/order.interface";
import Order from "@/resources/order/order.model";
import log from "@/utils/logger";
import { Schema } from "mongoose";

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

  public async fetchOrders(): Promise<object | Error> {
    try {
      //todo: filtering and searches
      const orders = await this.orderModel
        .find({})
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

      return orders;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching orders");
    }
  }
}

export default OrderService;
