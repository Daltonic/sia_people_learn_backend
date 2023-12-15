import { Document, Schema, model } from "mongoose";

export interface ISubscription extends Document {
  userId: Schema.Types.ObjectId;
  status: "Pending" | "Completed";
  productType: "Course" | "Academy";
  productId: Schema.Types.ObjectId;
  productModelType: "Course" | "Academy";
  paymentFrequency: number;
  paymentFrequencyType: string;
  orderId: Schema.Types.ObjectId;
  amount: number;
  currentCourse?: Schema.Types.ObjectId | null;
  currentLesson?: Schema.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  productType: { type: String, enum: ["Course", "Academy"], required: true },
  productId: { type: Schema.Types.ObjectId, refPath: "productModelType" },
  productModelType: { type: String, enum: ["Course", "Academy"] },
  paymentFrequency: { type: Number, required: true },
  paymentFrequencyType: {
    type: String,
    enum: ["Month", "Year"],
    required: true,
  },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  currentCourse: { type: Schema.Types.ObjectId, ref: "Course" },
  currentLesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;
