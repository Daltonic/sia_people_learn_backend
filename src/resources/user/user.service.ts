import {
  ForgotPasswordInterface,
  RegisterInterface,
  VerifyUserInterface,
  ResetPasswordInterface,
  UpdatePasswordInterface,
  UpgradeUserInterface,
  DowngradeUserInterface,
} from "@/resources/user/user.interface";
import User from "./user.model";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { generateAlphanumeric, log } from "@/utils/index";
import sendEmail, { generateEmail } from "@/utils/mailer";
import { passwordResetMail, verificationMail } from "@/utils/templates/mails";

class UserService {
  private userModel = User;

  public async register(userInput: RegisterInterface): Promise<string | Error> {
    try {
      // If this is the first user to be created, default userType to Admin. Otherwise, create as User
      const userType =
        (await this.userModel.countDocuments({})) === 0 ? "admin" : "user";

      // Hash the password;
      const hashedPassword = await argon2.hash(userInput.password);

      // Create the username
      const stripedEmail = userInput.email.split("@");
      const username = `${stripedEmail[0]}_${generateAlphanumeric(6)}`;

      // Create the new user
      const newUser = await this.userModel.create({
        ...userInput,
        password: hashedPassword,
        username,
        userType,
      });

      // Generate account verification link
      const verificationLink = `${process.env.ORIGIN}/api/v1/users/verify?verificationCode=${newUser.verificationCode}&userId=${newUser._id}`;

      const verifyAccountMail = await generateEmail(
        {
          name: newUser.firstName,
          link: verificationLink,
        },
        verificationMail
      );
      const mailSendSuccess = await sendEmail(
        newUser.email,
        verifyAccountMail,
        "Verify Your Account"
      );
      log.info(verificationLink);

      if (mailSendSuccess) {
        return "User successfully created. Check your email to verify your account";
      } else {
        return "Could not send verification mail";
      }
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.code === 11000 ? "Account already exists" : e.message);
    }
  }

  public async verify(
    verificationInput: VerifyUserInterface
  ): Promise<string | Error> {
    const { verificationCode, userId } = verificationInput;

    try {
      // Get the user
      const dbUser = await this.userModel.findById(userId);
      if (!dbUser) {
        throw new Error("User not found");
      }

      if (dbUser.verified) {
        return "User already verified";
      }

      if (dbUser.verificationCode !== verificationCode) {
        throw new Error("Invalid verification code");
      }

      // Update the user's verification status and save the verified user
      dbUser.verified = true;
      await dbUser.save();

      return "Your account has been successfully verified";
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error verifying User");
    }
  }

  public async forgotPassword(
    forgotPasswordInput: ForgotPasswordInterface
  ): Promise<string | Error> {
    const { email } = forgotPasswordInput;

    try {
      const user = await this.userModel.findOne({ email: email });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.verified) {
        throw new Error("Account not verified");
      }

      const recoveryCode = nanoid();
      user.recoveryCode = recoveryCode;
      await user.save();

      const passwordResetLink = `${process.env.ORIGIN}/api/v1/users/resetPassword?passwordResetCode=${user.recoveryCode}&userId=${user._id}`;

      // todo: Add implementation for emailing verification code
      const resetPasswordMail = await generateEmail(
        {
          name: user.firstName,
          link: passwordResetLink,
        },
        passwordResetMail
      );
      const mailSendSuccess = await sendEmail(
        user.email,
        resetPasswordMail,
        "Verify Your Account"
      );

      log.info(passwordResetLink);

      if (mailSendSuccess) {
        return `Please visit your email to reset your password`;
      } else {
        return "Password reset mail could not be sent";
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  public async resetPassword(
    resetPasswordQuery: ResetPasswordInterface["query"],
    resetPasswordBody: ResetPasswordInterface["body"]
  ): Promise<string | Error> {
    const { passwordResetCode, userId } = resetPasswordQuery;
    const { password } = resetPasswordBody;

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.recoveryCode || user.recoveryCode !== passwordResetCode) {
        throw new Error("Invalid password reset details");
      }

      const hashedPassword = await argon2.hash(password);
      user.password = hashedPassword;
      user.recoveryCode = null;

      await user.save();

      return "Password successfully reset";
    } catch (e: any) {
      throw new Error("Error resetting password");
    }
  }

  public async updatePassword(
    updatePasswordInput: UpdatePasswordInterface,
    userId: string
  ): Promise<string | Error> {
    const { currentPassword, newPassword } = updatePasswordInput;

    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error("Password is incorrect");
      }

      const hashedPassword = await argon2.hash(newPassword);
      user.password = hashedPassword;

      await user.save();

      return "Password successfully updated";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message);
    }
  }

  public async upgradeUser(
    upgradeInput: UpgradeUserInterface
  ): Promise<string | Error> {
    const { userId, upgradeUserTo } = upgradeInput;
    try {
      // Ensure that the user currently exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("This user does not exist");
      }

      if (user.userType === upgradeUserTo) {
        return `This user is already an ${upgradeUserTo}`;
      }

      user.userType = upgradeUserTo;
      await user.save();

      return `User has been successfully upgraded to an ${upgradeUserTo}`;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error upgrading user");
    }
  }

  public async downgradeUser(
    downgradeInput: DowngradeUserInterface
  ): Promise<string | Error> {
    const { userId, downgradeUserTo } = downgradeInput;

    try {
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("This user does not exist");
      }

      if (user.userType === downgradeUserTo) {
        return `This user is already ${
          downgradeUserTo === "instructor" ? "an" : "a"
        } ${downgradeUserTo}`;
      }

      user.userType = downgradeUserTo;
      await user.save();

      return `User has been successfully downgraded to ${
        downgradeUserTo === "instructor" ? "an" : "a"
      } ${downgradeUserTo}`;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error downgrading user");
    }
  }
}

export default UserService;
