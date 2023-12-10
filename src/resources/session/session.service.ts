import User from "@/resources/user/user.model";
import Session from "@/resources/session/session.model";
import { LoginInterface } from "./session.interface";
import { createAccessToken, createRefreshToken } from "@/utils/token";
import { filteredUser } from "@/utils/response-filter";

class SessionService {
  private userModel = User;
  private sessionModel = Session;

  public async login(loginInput: LoginInterface): Promise<object | void> {
    const { email, password } = loginInput;

    try {
      const user = await this.userModel.findOne({ email: email });

      if (!user) {
        throw new Error("Invalid Email or Password");
      }

      if (!user.verified) {
        throw new Error("Account is not verified");
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error("Invalid Email or Password");
      }

      // Remove an oldSession if any exists
      await this.sessionModel.findOneAndDelete({ user: user._id });

      const newSession = await this.sessionModel.create({ user: user._id });

      // Sign access token
      const accessToken = createAccessToken(user);

      // sign refreshToken
      const refreshToken = createRefreshToken(newSession._id);

      // Update user's lastLogin
      user.lastLogin = new Date(Date.now());
      await user.save();

      return { user: filteredUser(user), accessToken, refreshToken };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default SessionService;
