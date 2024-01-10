import { Document, Schema, model } from "mongoose";

export interface IRequest extends Document {
  userId: Schema.Types.ObjectId;
  requestType: "UserUpgradeRequent" | "UserDowngradeRequest";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    requestType: {
      type: String,
      enum: ["UserUpgradeRequest", "UserDowngradeRequest"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Request = model<IRequest>("Request", RequestSchema);
export default Request;
