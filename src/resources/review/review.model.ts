import { Schema, Document, model } from "mongoose";

export interface IReview extends Document {
  userId: Schema.Types.ObjectId;
  productType: "Course" | "Academy";
  productModelType: "Course" | "Academy";
  productId: Schema.Types.ObjectId;
  starRating: number;
  comment: string;
  approved: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productType: { type: String, enum: ["Course", "Academy"], required: true },
    productId: { type: Schema.Types.ObjectId, refPath: "productModelType" },
    productModelType: { type: String, enum: ["Course", "Academy"] },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review = model<IReview>("Review", ReviewSchema);
export default Review;
