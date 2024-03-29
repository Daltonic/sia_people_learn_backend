import log from "@/utils/logger";
import argon2 from "argon2";
import { Schema, model, Document } from "mongoose";
import { nanoid } from "nanoid";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  imgUrl?: string;
  userType: "admin" | "instructor" | "user";
  password: string;
  verificationCode: string;
  verified: boolean;
  recoveryCode?: string | null;
  rememberMe: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  courses: Schema.Types.ObjectId[];
  academies: Schema.Types.ObjectId[];
  reviewedCourses: Schema.Types.ObjectId[];
  reviewedAcademies: Schema.Types.ObjectId[];
  subscriptions: Schema.Types.ObjectId[];
  subscribedCourses: Schema.Types.ObjectId[];
  subscribedAcademies: Schema.Types.ObjectId[];
  requests: Schema.Types.ObjectId[];
  linkedInProfile?: string;
  tutorialTitle?: string;
  samplesLink?: string;
  specialty?: string | null;
  pendingRequests?: number | null;
  validatePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    username: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    userType: {
      type: String,
      enum: ["admin", "instructor", "user"],
      default: "user",
    },
    password: { type: String },
    verificationCode: { type: String, default: () => nanoid() },
    verified: { type: Boolean, default: false },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    academies: [{ type: Schema.Types.ObjectId, ref: "Academy" }],
    reviewedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    reviewedAcademies: [{ type: Schema.Types.ObjectId, ref: "Academy" }],
    subscribedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    subscribedAcademies: [{ type: Schema.Types.ObjectId, ref: "Academy" }],
    subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }],
    recoveryCode: { type: String },
    rememberMe: { type: Boolean, default: false },
    lastLogin: { type: Date },
    requests: [{ type: Schema.Types.ObjectId, ref: "Request" }],
    linkedInProfile: { type: String },
    tutorialTitle: { type: String },
    samplesLink: { type: String },
    specialty: { type: String },
    pendingRequests: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.methods.validatePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (e: any) {
    log.error(e, "Could not validate password");
    return false;
  }
};

const User = model<IUser>("User", UserSchema);

export default User;
