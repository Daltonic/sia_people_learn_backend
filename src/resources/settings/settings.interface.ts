import { TypeOf } from "zod";
import {
  FetchSiteSettingsSchema,
  createSiteSettingsSchema,
  updateSiteSettingsSchema,
} from "@/resources/settings/settings.validation";

export type CreateSiteSettingsInterface = TypeOf<
  typeof createSiteSettingsSchema
>["body"];
export type UpdateSiteSettingsInterface = TypeOf<
  typeof updateSiteSettingsSchema
>;

export type FetchSiteSettingsInterface = TypeOf<
  typeof FetchSiteSettingsSchema
>["params"];
