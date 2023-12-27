import { TypeOf } from "zod";
import {
  createSubsciptionSchema,
  deleteSubscriptionSchema,
  fetchSubscriptionsSchema,
} from "@/resources/subscription/subscription.validation";

export type CreateSubscriptionInterface = TypeOf<
  typeof createSubsciptionSchema
>["body"];

export type DeleteSubscriptionInterface = TypeOf<
  typeof deleteSubscriptionSchema
>["params"];

export type FetchSubscriptionsInterface = TypeOf<
  typeof fetchSubscriptionsSchema
>["query"];
