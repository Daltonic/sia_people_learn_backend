import generateAlphanumeric from "@/utils/generateAlphanum";
import { Document, Schema, model } from "mongoose";

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  orderCode: string;
  promoId?: Schema.Types.ObjectId;
  total: number;
  transactionRef: string;
  paymentType: "Stripe" | "Crypto";
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderCode: { type: String, default: generateAlphanumeric(10) },
    promoId: { type: Schema.Types.ObjectId, ref: "Promo" },
    total: { type: Number, required: true },
    transactionRef: { type: String, default: generateAlphanumeric(10) },
    paymentType: { type: String, enum: ["Stripe", "Crypto"], required: true },
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = model<IOrder>("Order", OrderSchema);
export default Order;
