import Promo from "@/resources/promo/promo.model";
import User from "@/resources/user/user.model";
import { CreatePromoInterface } from "./promo.interface";
import log from "@/utils/logger";

class PromoService {
  private promoModel = Promo;
  private userModel = User;

  public async createPromo(
    promoInput: CreatePromoInterface,
    userId: string
  ): Promise<object | Error> {
    const { percentage, promoType } = promoInput;

    try {
      // Ensure that the user exists and that he has the permission to create this promo
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (
        (promoType === "ManualSalesPromo" || promoType === "SiteWidePromo") &&
        user.userType !== "admin"
      ) {
        throw new Error(`User is not permitted to create ${promoType}`);
      }

      const promo = await this.promoModel.create({
        percentage,
        promoType,
        userId,
        validated: ["ManualSalesPromo", "SiteWidePromo"].includes(promoType),
      });

      return promo;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Promo");
    }
  }

  public async fetchPromos(): Promise<object | Error> {
    try {
      const promos = await this.promoModel.find({}).populate({
        path: "userId",
        model: this.userModel,
        select: "_id firstName lastName username",
      });
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
