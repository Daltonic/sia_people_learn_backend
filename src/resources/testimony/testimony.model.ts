import { Document, Schema, model } from "mongoose";

export interface ITestimony extends Document {
  statement: string;
  profession: string;
  approved: boolean;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonySchema = new Schema<ITestimony>(
  {
    statement: { type: String, required: true },
    profession: { type: String, required: true },
    approved: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Testimony = model<ITestimony>("Testimony", TestimonySchema);
export default Testimony;
