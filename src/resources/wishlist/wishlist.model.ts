import { Document, Schema, model } from "mongoose";

export interface IWishlist extends Document {
  productType: "Course" | "Academy";
  productId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  productModelType: "Course" | "Academy";
}

const WishlistSchema = new Schema<IWishlist>({
  productType: { type: String, enum: ["Course", "Academy"] },
  productId: { type: Schema.Types.ObjectId, refPath: "productModelType" },
  productModelType: { type: String, enum: ["Course", "Academy"] },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const WishList = model<IWishlist>("Wishlist", WishlistSchema);
export default WishList;
