import { TypeOf } from "zod";
import {
  createSubsciptionSchema,
  deleteSubscriptionSchema,
  fetchSubscriptionsSchema,
  fetchUserSubscriptionsSchema,
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

export type FetchUserSubscriptionsInterface = TypeOf<
  typeof fetchUserSubscriptionsSchema
>["query"];
