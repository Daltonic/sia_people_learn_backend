import deserialiseUser from "./deserialiseUser.middleware";
import errorMiddleware from "./error.middleware";
import isAdmin from "./isAdmin";
import isAdminOrInstructor from "./isAdminOrInstructor";
import isInstructor from "./isInstructor";
import loggedIn from "./loggedIn.middleware";
import validateResource from "./validation.middleware";

export {
  deserialiseUser,
  errorMiddleware,
  isAdminOrInstructor,
  loggedIn,
  validateResource,
  isInstructor,
  isAdmin,
};
