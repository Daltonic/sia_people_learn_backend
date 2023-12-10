import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  valid: boolean;
  user: Schema.Types.ObjectId;
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    valid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Session = model<ISession>("Session", SessionSchema);
export default Session;
