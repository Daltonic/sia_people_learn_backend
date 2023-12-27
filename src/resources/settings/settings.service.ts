import SiteSettings, {
  ISitesSetting,
} from "@/resources/settings/settings.model";
import {
  CreateSiteSettingsInterface,
  UpdateSiteSettingsInterface,
} from "@/resources/settings/settings.interface";
import log from "@/utils/logger";

class SiteSettingsService {
  private siteSettingsModel = SiteSettings;

  public async createSiteSettings(
    settingsInput: CreateSiteSettingsInterface
  ): Promise<object | Error> {
    const { bannerUrl, bannerCaption, bannerText } = settingsInput;

    try {
      const settings = await this.siteSettingsModel.find().limit(1);

      if (settings.length === 1) {
        const existingSetting = settings[0];

        existingSetting.bannerCaption = bannerCaption;
        existingSetting.bannerUrl = bannerUrl;
        existingSetting.bannerText = bannerText;

        await existingSetting.save();
        return existingSetting;
      } else {
        const setting = await this.siteSettingsModel.create({
          bannerCaption,
          bannerUrl,
          bannerText,
        });

        return setting;
      }
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Site Settings");
    }
  }

  public async fetchSiteSettings(): Promise<object | Error> {
    try {
      const settings = await this.siteSettingsModel.find({});
      return settings[0];
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Site Setting");
    }
  }
}

export default SiteSettingsService;
