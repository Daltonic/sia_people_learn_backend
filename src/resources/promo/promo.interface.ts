import { TypeOf } from "zod";
import {
  createPromoSchema,
  fetchPromosSchema,
  invalidatePromoSchema,
  validatePromoSchema,
} from "@/resources/promo/promo.validation";

export type CreatePromoInterface = TypeOf<typeof createPromoSchema>["body"];
export type ValidatePromoInterface = TypeOf<
  typeof validatePromoSchema
>["params"];
export type InvalidatePromoInterface = TypeOf<
  typeof invalidatePromoSchema
>["params"];

export type FetchPromosInterface = TypeOf<typeof fetchPromosSchema>["query"];
