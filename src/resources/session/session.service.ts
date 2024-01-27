import User from "@/resources/user/user.model";
import Session from "@/resources/session/session.model";
import { LoginInterface } from "./session.interface";
import {
  createAccessToken,
  createRefreshToken,
  filteredUser,
  verifyRefreshToken,
} from "@/utils/index";

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

  public async refreshSession(refreshToken: string): Promise<string | Error> {
    try {
      // Decode the refresh token
      const decodedToken = verifyRefreshToken<{ session: string }>(
        refreshToken
      );
      if (!decodedToken) {
        throw new Error("Could not refresh token");
      }

      // Fetch the user's session using the decoded token
      const session = await this.sessionModel.findById(decodedToken.session);

      if (!session || !session.valid) {
        throw new Error("Could not refresh token");
      }

      // Fetch the user that created the session
      const user = await this.userModel.findById(session.user);
      if (!user) {
        throw new Error("Could not refresh token");
      }

      // Create a new accessToken and send it back to the frontend
      const accessToken = createAccessToken(user);

      return accessToken;
    } catch (e: any) {
      throw new Error(e.message || "Error refreshing session");
    }
  }

  public async logout(userId: string): Promise<string | Error> {
    try {
      // Fetch the current session
      const session = await this.sessionModel.findOne({ user: userId });

      if (!session) {
        return "Logout successful";
      }

      await this.sessionModel.findByIdAndDelete(session._id);

      return "Logout successful";
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default SessionService;
