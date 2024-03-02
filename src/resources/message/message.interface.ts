import { TypeOf } from "zod";
import { sendMessageSchema } from "./message.validation";

export type SendMessageInterface = TypeOf<typeof sendMessageSchema>["body"];
