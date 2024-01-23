import { Document, Schema, model } from "mongoose";

export interface IAcademy extends Document {
  name: string;
  description: string;
  overview: string;
  imageUrl?: string;
  ref?: string | null;
  price: number;
  validity: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  submitted: boolean;
  approved: boolean;
  deleted: boolean;
  orderCount: number;
  rating?: number | null;
  reviews: Schema.Types.ObjectId[];
  reviewsCount: number;
  courses: Schema.Types.ObjectId[];
  highlights: string[];
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
  tags: Schema.Types.ObjectId[];
  userId: Schema.Types.ObjectId;
}

const AcademySchema = new Schema<IAcademy>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    imageUrl: { type: String },
    ref: { type: String, default: null },
    price: { type: Number, required: true },
    validity: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: { type: Number, default: 0 },
    submitted: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    orderCount: { type: Number, default: 0 },
    rating: { type: Number, default: null },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    reviewsCount: { type: Number, default: 0 },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    highlights: [{ type: String }],
    requirements: [{ type: String }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    userId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Academy = model<IAcademy>("Academy", AcademySchema);
export default Academy;
