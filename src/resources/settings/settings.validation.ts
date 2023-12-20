import { object, string } from "zod";

export const createSiteSettingsSchema = object({
  body: object({
    bannerUrl: string({ required_error: "Banner url is required" }),
    bannerCaption: string({ required_error: "Banner caption is required" }),
    bannerText: string({ required_error: "Banner text is required" }),
  }),
});

export const updateSiteSettingsSchema = object({
  body: object({
    bannerUrl: string().optional(),
    bannerCaption: string().optional(),
    bannerText: string().optional(),
  }),
  params: object({
    settingsId: string({ required_error: "settingId is required" }),
  }),
});

export const FetchSiteSettingsSchema = object({
  params: object({
    settingId: string({ required_error: "settingId is required" }),
  }),
});
