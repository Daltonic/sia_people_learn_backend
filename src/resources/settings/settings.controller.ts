import { NextFunction, Request, Response, Router } from "express";
import SiteSettingsService from "@/resources/settings/settings.service";
import Controller from "@/utils/interfaces/controller.interface";
import {
  CreateSiteSettingsInterface,
  FetchSiteSettingsInterface,
  UpdateSiteSettingsInterface,
} from "@/resources/settings/settings.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { isAdmin, validateResource } from "@/middlewares/index";
import {
  FetchSiteSettingsSchema,
  createSiteSettingsSchema,
  updateSiteSettingsSchema,
} from "@/resources/settings/settings.validation";

class SiteSettingsController implements Controller {
  public path = "/site-settings";
  public router = Router();
  private siteSettingsService = new SiteSettingsService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.patch(
      `${this.path}/create`,
      [isAdmin, validateResource(createSiteSettingsSchema)],
      this.createSiteSettings
    );

    this.router.get(`${this.path}`, isAdmin, this.fetchSiteSettings);
  }

  private createSiteSettings = async (
    req: Request<{}, {}, CreateSiteSettingsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const settingsInput = req.body;
    try {
      const settings =
        await this.siteSettingsService.createSiteSettings(settingsInput);
      res.status(StatusCodes.CREATED).json(settings);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchSiteSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const settings = await this.siteSettingsService.fetchSiteSettings();
      res.status(StatusCodes.OK).json(settings);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default SiteSettingsController;
