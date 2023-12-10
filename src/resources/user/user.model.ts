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
  validatePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    userType: {
      type: String,
      enum: ["admin", "instructor", "user"],
      default: "user",
    },
    password: { type: String, required: true },
    verificationCode: { type: String, default: () => nanoid() },
    verified: { type: Boolean, default: false },
    recoveryCode: { type: String },
    rememberMe: { type: Boolean, default: false },
    lastLogin: { type: Date },
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
