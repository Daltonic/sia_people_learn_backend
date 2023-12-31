import generateAlphanumeric from "@/utils/generateAlphanum";
import { Document, Schema, model } from "mongoose";

export interface IPromo extends Document {
  code: string;
  percentage: Number;
  promoType: "SiteWidePromo";
  validated: boolean;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>(
  {
    code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true },
    promoType: {
      type: String,
      default: "SiteWidePromo",
    },
    validated: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Promo = model<IPromo>("Promo", PromoSchema);
export default Promo;
