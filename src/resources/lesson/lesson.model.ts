import { Schema, model, Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  overview: string;
  description: string;
  duration: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  downloadableUrl?: string | null;
  order: number;
  courseId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, unique: true },
    overview: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    downloadableUrl: { type: String },
    order: { type: Number, required: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);

const Lesson = model<ILesson>("Lesson", LessonSchema);

export default Lesson;
