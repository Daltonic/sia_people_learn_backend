import { Document, Schema, model } from "mongoose";

export interface ISitesSetting extends Document {
  bannerUrl: string;
  bannerCaption: string;
  bannerText: string;
}

const SiteSettingsSchema = new Schema<ISitesSetting>({
  bannerUrl: { type: String, required: true },
  bannerCaption: { type: String, required: true },
  bannerText: { type: String, required: true },
});

const SiteSettings = model<ISitesSetting>("SiteSettings", SiteSettingsSchema);
export default SiteSettings;
