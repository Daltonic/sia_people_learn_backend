import Promo from "@/resources/promo/promo.model";
import User from "@/resources/user/user.model";
import { CreatePromoInterface, FetchPromosInterface } from "./promo.interface";
import log from "@/utils/logger";
import { FilterQuery } from "mongoose";

class PromoService {
  private promoModel = Promo;
  private userModel = User;

  public async createPromo(
    promoInput: CreatePromoInterface,
    userId: string
  ): Promise<object | Error> {
    const { percentage, code } = promoInput;

    try {
      // Ensure that the user exists and that he has the permission to create this promo
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const promo = await this.promoModel.create({
        percentage,
        userId,
        code,
        validated: true,
      });

      return promo;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Promo");
    }
  }

  public async fetchPromos(
    queryOptions: FetchPromosInterface
  ): Promise<object | Error> {
    const { page, pageSize, filter, validated } = queryOptions;
    try {
      const query: FilterQuery<typeof this.promoModel> = {};

      if (validated) {
        query.validated = validated === "true";
      }

      // Define the sorting strategy
      let sortOptions = {};
      switch (filter) {
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const promos = await this.promoModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id firstName lastName username",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions);
      return promos;
    } catch (e: any) {
      throw new Error(e.message || "Error fetching Promos");
    }
  }

  public async validatePromo(promoId: string): Promise<string | Error> {
    try {
      // Ensure that the promo exists in the first place
      const promo = await this.promoModel.findById(promoId);
      if (!promo) {
        throw new Error("Promo not found");
      }

      if (promo.validated) {
        return "Promo already validated";
      }

      promo.validated = true;
      await promo.save();

      return "Promo has been validated";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error validating Promo");
    }
  }

  public async invalidatePromo(promoId: string): Promise<string | Error> {
    try {
      // Check that the promo exists
      const promo = await this.promoModel.findById(promoId);
      if (!promo) {
        throw new Error("Promo not found");
      }

      if (!promo.validated) {
        return "Promo is already invalid";
      }

      promo.validated = false;
      await promo.save();
      return "Promo has been invalidated.";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error invalidating Promo");
    }
  }
}

export default PromoService;
