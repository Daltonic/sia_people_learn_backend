import generateAlphanumeric from "@/utils/generate-alphanum";
import { RegisterInterface } from "./user.interface";
import User from "./user.model";
import argon2 from "argon2";

class UserService {
  private user = User;

  public async register(userInput: RegisterInterface): Promise<string | Error> {
    try {
      // If this is the first user to be created, default userType to Admin. Otherwise, create as User
      const userType =
        (await this.user.countDocuments({})) === 0 ? "admin" : "user";

      // Hash the password;
      const hashedPassword = await argon2.hash(userInput.password);

      // Create the username
      const stripedEmail = userInput.email.split("@");
      const username = `${stripedEmail}_${generateAlphanumeric(6)}`;

      const newUser = await this.user.create({
        ...userInput,
        password: hashedPassword,
        username,
      });
      console.log(newUser);

      return "User successfully created";
    } catch (e: any) {
      throw new Error(e.code === 11000 ? "Account already exists" : e.message);
    }
  }
}

export default UserService;
