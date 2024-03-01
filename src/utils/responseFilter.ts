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
    subscribedAcademies,
    subscribedCourses,
    reviewedCourses,
    reviewedAcademies,
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
    subscribedAcademies,
    subscribedCourses,
    reviewedAcademies,
    reviewedCourses,
  };
};
