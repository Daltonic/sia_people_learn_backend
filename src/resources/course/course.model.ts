import { Schema, model, Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  price: number;
  description: string;
  overview: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  validity: number;
  lessonsCount?: number;
  ordersCount?: number;
  imageUrl?: string;
  submitted: boolean;
  approved: boolean;
  type: "Course" | "Book";
  deleted: boolean;
  rating?: number;
  reviews: Schema.Types.ObjectId[];
  reviewsCount: number;
  tags: string[];
  requirements: string[];
  highlights: string[];
  userId: Schema.Types.ObjectId;
  lessons?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    type: {
      type: String,
      enum: ["Course", "Book"],
    },
    duration: { type: Number, default: 0 },
    validity: { type: Number, default: 0 },
    lessonsCount: { type: Number },
    ordersCount: { type: Number },
    imageUrl: { type: String },
    submitted: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    highlights: [{ type: String }],
    requirements: [{ type: String }],
    rating: { type: Number },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    reviewsCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    slug: { type: String },
  },
  { timestamps: true }
);

const Course = model<ICourse>("Course", CourseSchema);

export default Course;
