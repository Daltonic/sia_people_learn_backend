import { object, string } from "zod";

export const createSiteSettingsSchema = object({
  body: object({
    bannerUrl: string(),
    bannerCaption: string(),
    bannerText: string(),
  }),
});

export const updateSiteSettingsSchema = object({
  body: object({
    bannerUrl: string().optional(),
    bannerCaption: string().optional(),
    bannerText: string().optional(),
  }),
  params: object({
    settingsId: string(),
  }),
});

export const FetchSiteSettingsSchema = object({
  params: object({
    settingId: string(),
  }),
});
