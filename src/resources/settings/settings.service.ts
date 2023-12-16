import SiteSettings, {
  ISitesSetting,
} from "@/resources/settings/settings.model";
import {
  CreateSiteSettingsInterface,
  UpdateSiteSettingsInterface,
} from "@/resources/settings/settings.interface";
import log from "@/utils/logger";

class SiteSettingsService {
  private siteSettings = SiteSettings;

  public async createSiteSettings(
    settingsInput: CreateSiteSettingsInterface
  ): Promise<object | Error> {
    const { bannerUrl, bannerCaption, bannerText } = settingsInput;

    try {
      const settings = await this.siteSettings.create({
        bannerCaption,
        bannerUrl,
        bannerText,
      });

      return settings;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Site Settings");
    }
  }

  public async updateSiteSettings(
    settingsInput: UpdateSiteSettingsInterface["body"],
    settingsId: string
  ): Promise<object | Error> {
    const { bannerUrl, bannerCaption, bannerText } = settingsInput;

    try {
      if (!bannerUrl && !bannerText && !bannerCaption) {
        throw new Error("Missing update data");
      }

      // Fetch the settings;
      const settings = await this.siteSettings.findById(settingsId);
      if (!settings) {
        throw new Error("Settings does exist");
      }

      const newSettings = await this.siteSettings.findByIdAndUpdate(
        settingsId,
        {
          bannerUrl: bannerUrl || settings.bannerUrl,
          bannerText: bannerText || settings.bannerText,
          bannerCaption: bannerCaption || settings.bannerCaption,
        }
      );

      return newSettings!;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating Site Settings");
    }
  }

  public async fetchSiteSettingsById(
    settingsId: string
  ): Promise<object | Error> {
    try {
      const settings = await this.siteSettings.findById(settingsId);
      if (!settings) {
        throw new Error("Site Settings not found");
      }
      return settings;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Site Settings by Id");
    }
  }

  public async fetchSiteSettings(): Promise<object | Error> {
    try {
      const settings = await this.siteSettings.find({});
      return settings[0];
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Site Setting");
    }
  }
}

export default SiteSettingsService;
