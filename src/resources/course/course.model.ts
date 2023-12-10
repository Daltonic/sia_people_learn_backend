import { Schema, model, Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  price: number;
  description: string;
  overview: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  lessonsCount?: number;
  ordersCount?: number;
  imageUrl?: string;
  submitted: boolean;
  approved: boolean;
  rating?: number;
  tags: string[];
  userId: Schema.Types.ObjectId;
  lessons?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    duration: { type: Number, default: 0 },
    lessonsCount: { type: Number },
    ordersCount: { type: Number },
    imageUrl: { type: String },
    submitted: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    rating: { type: Number },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

const Course = model<ICourse>("Course", CourseSchema);

export default Course;
