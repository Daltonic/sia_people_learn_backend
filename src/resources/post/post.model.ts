import { Document, Schema, model } from "mongoose";

export interface IPost extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  category: string;
  overview: string;
  description: string;
  imageUrl: string | null;
  parentId: Schema.Types.ObjectId | null;
  comments: Schema.Types.ObjectId[];
  commentsCount: number;
  deleted: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    overview: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    parentId: { type: Schema.Types.ObjectId },
    deleted: { type: Boolean, default: false },
    comments: [{ type: Schema.Types.ObjectId, ref: this }],
    commentsCount: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Post = model<IPost>("Post", PostSchema);
export default Post;
