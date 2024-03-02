import { object, string } from "zod";

export const sendMessageSchema = object({
  body: object({
    message: string({ required_error: "Message is required" }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
    name: string({ required_error: "Name is required" }),
  }),
});
