import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import WishlistService from "@/resources/wishlist/wishlist.service";
import {
  CreateWishlistInterface,
  DeleteWishlistInterface,
  FetchWishtListsInterface,
} from "@/resources/wishlist/wishlist.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";
import { loggedIn, validateResource } from "@/middlewares/index";
import {
  createWishlistSchema,
  deleteWishlistSchema,
  fetchWishlistSchema,
} from "@/resources/wishlist/wishlist.validation";

class WishlistController implements Controller {
  public path = "/wishlists";
  public router = Router();
  private wishlistService = new WishlistService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/create`,
      [loggedIn, validateResource(createWishlistSchema)],
      this.createWishlist
    );

    this.router.delete(
      `${this.path}/delete/:wishlistId`,
      [loggedIn, validateResource(deleteWishlistSchema)],
      this.deleteWishlist
    );

    this.router.get(
      `${this.path}`,
      [loggedIn, validateResource(fetchWishlistSchema)],
      this.fetchWishlists
    );
  }

  private createWishlist = async (
    req: Request<{}, {}, CreateWishlistInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const wishlistInput = req.body;
    const { _id: userId } = res.locals.user;
    try {
      const wishlist = await this.wishlistService.createWishlist(
        wishlistInput,
        userId
      );
      res.status(StatusCodes.CREATED).json(wishlist);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private deleteWishlist = async (
    req: Request<DeleteWishlistInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { wishlistId } = req.params;
    const { _id: userId } = res.locals.user;

    try {
      const message = await this.wishlistService.deleteWishlist(
        userId,
        wishlistId
      );
      res.status(StatusCodes.OK).send(message);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };

  private fetchWishlists = async (
    req: Request<{}, {}, {}, FetchWishtListsInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { _id: userId } = res.locals.user;
    const queryOptions = req.query;
    try {
      const wishlists = await this.wishlistService.fetchWishlists(
        userId,
        queryOptions
      );
      res.status(StatusCodes.OK).json(wishlists);
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default WishlistController;
