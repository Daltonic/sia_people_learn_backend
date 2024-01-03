import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Router, Response } from "express";
import PromoService from "@/resources/promo/promo.service";
import {
  CreatePromoInterface,
  FetchPromosInterface,
  InvalidatePromoInterface,
  ValidatePromoInterface,
} from "@/resources/promo/promo.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import {
  isAdmin,
  isAdminOrInstructor,
  loggedIn,
  validateResource,
} from "@/middlewares/index";
import {
  createPromoSchema,
  fetchPromosSchema,
  invalidatePromoSchema,
  validatePromoSchema,
} from "@/resources/promo/promo.validation";

class PromoController implements Controller {
  public path = "/promos";
  public router = Router();
  private promoService = new PromoService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [isAdmin, validateResource(createPromoSchema)],
      this.createPromo
    );

    this.router.get(
      `${this.path}`,
      [isAdmin, validateResource(fetchPromosSchema)],
      this.fetchPromos
    );

    this.router.put(
      `${this.path}/validate/:promoId`,
      [isAdmin, validateResource(validatePromoSchema)],
      this.validatePromo
    );

    this.router.put(
      `${this.path}/invalidate/:promoId`,
      [isAdmin, validateResource(invalidatePromoSchema)],
      this.invalidatePromo
    );
  }

  private createPromo = async (
    req: Request<{}, {}, CreatePromoInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const promoInput = req.body;
    const { _id: userId } = res.locals.user;

    try {
      const promo = await this.promoService.createPromo(promoInput, userId);
      res.status(StatusCodes.CREATED).json(promo);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchPromos = async (
    req: Request<{}, {}, {}, FetchPromosInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const queryOptions = req.query;
    try {
      const promos = await this.promoService.fetchPromos(queryOptions);
      res.status(StatusCodes.OK).json(promos);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private validatePromo = async (
    req: Request<ValidatePromoInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { promoId } = req.params;

    try {
      const message = await this.promoService.validatePromo(promoId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private invalidatePromo = async (
    req: Request<InvalidatePromoInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { promoId } = req.params;
    try {
      const message = await this.promoService.invalidatePromo(promoId);
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default PromoController;
