import { TypeOf } from "zod";
import {
  createSubsciptionSchema,
  deleteSubscriptionSchema,
} from "@/resources/subscription/subscription.validation";

export type CreateSubscriptionInterface = TypeOf<
  typeof createSubsciptionSchema
>["body"];

export type DeleteSubscriptionInterface = TypeOf<
  typeof deleteSubscriptionSchema
>["params"];
