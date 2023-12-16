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
    this.router.post(
      `${this.path}/create`,
      [isAdmin, validateResource(createSiteSettingsSchema)],
      this.createSiteSettings
    );

    this.router.put(
      `${this.path}/update/:settingsId`,
      [isAdmin, validateResource(updateSiteSettingsSchema)],
      this.updateSiteSettings
    );

    this.router.get(
      `${this.path}/:settingId`,
      [isAdmin, validateResource(FetchSiteSettingsSchema)],
      this.fetchSiteSettingsById
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

  private updateSiteSettings = async (
    req: Request<
      UpdateSiteSettingsInterface["params"],
      {},
      UpdateSiteSettingsInterface["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const settingsInput = req.body;
    const { settingsId } = req.params;

    try {
      const settings = await this.siteSettingsService.updateSiteSettings(
        settingsInput,
        settingsId
      );
      res.status(StatusCodes.OK).json(settings);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchSiteSettingsById = async (
    req: Request<FetchSiteSettingsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { settingId } = req.params;

    try {
      const settings =
        await this.siteSettingsService.fetchSiteSettingsById(settingId);
      res.status(StatusCodes.OK).json(settings);
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
