import { Document, Schema, model } from "mongoose";

export interface ITag extends Document {
  name: string;
  courses: Schema.Types.ObjectId[];
  academies: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId }],
    academies: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

const Tag = model<ITag>("Tag", TagSchema);
export default Tag;
