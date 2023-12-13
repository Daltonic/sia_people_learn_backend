import { TypeOf } from "zod";
import {
  createOrderSchema,
  fetchOrderSchema,
} from "@/resources/order/order.validation";

export type CreateOrderInterface = TypeOf<typeof createOrderSchema>["body"];
export type FetchOrderInterface = TypeOf<typeof fetchOrderSchema>["params"];
