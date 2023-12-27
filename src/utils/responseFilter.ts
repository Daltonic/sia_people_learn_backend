import { IUser } from "@/resources/user/user.model";

export const filteredUser = (user: IUser): Partial<IUser> => {
  const {
    _id,
    firstName,
    lastName,
    username,
    email,
    userType,
    createdAt,
    updatedAt,
    rememberMe,
    imgUrl,
    lastLogin,
  } = user;
  return {
    _id,
    firstName,
    lastName,
    username,
    email,
    userType,
    createdAt,
    updatedAt,
    lastLogin,
    rememberMe,
    imgUrl,
  };
};

