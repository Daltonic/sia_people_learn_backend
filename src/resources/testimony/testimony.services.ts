import User from "@/resources/user/user.model";
import Testimony from "@/resources/testimony/testimony.model";
import {
  CreateTestimonyInterface,
  FetchTestimoniesInterface,
  UpdateTestimonyInterface,
} from "@/resources/testimony/testimony.interface";
import log from "@/utils/logger";
import { FilterQuery } from "mongoose";

class TestimonyService {
  private userModel = User;
  private testimonyModel = Testimony;

  public async createTestimony(
    testimonyInput: CreateTestimonyInterface,
    userId: string
  ): Promise<object | Error> {
    const { statement, profession } = testimonyInput;

    try {
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const testimony = await this.testimonyModel.create({
        statement,
        profession,
        userId,
      });

      return testimony;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating Testimony");
    }
  }

  public async updateTestimony(
    testimonyInput: UpdateTestimonyInterface["body"],
    testimonyId: string,
    userId: string
  ): Promise<object | Error> {
    const { statement, profession } = testimonyInput;

    try {
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Ensure that the testimony exists
      const testimony = await this.testimonyModel.findById(testimonyId);
      if (!testimony) {
        throw new Error("Testimony not found");
      }

      // Ensure that only an admin or the testimony creator can update the testimony
      if (user.userType !== "admin" && String(testimony.userId) !== userId) {
        throw new Error("You are not permitted to update this Testimony");
      }

      // If there is no profession and no statement, just return the current testimony
      if (!statement && !profession) {
        return testimony;
      }

      const updatedTestimony = await this.testimonyModel.findByIdAndUpdate(
        testimonyId,
        {
          statement: statement || testimony.statement,
          profession: profession || testimony.profession,
        },
        { new: true }
      );

      return updatedTestimony!;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating Testimony");
    }
  }

  public async approveTestimony(testimonyId: string): Promise<string | Error> {
    try {
      // Ensure that the testimony exists
      const testimony = await this.testimonyModel.findById(testimonyId);
      if (!testimony) {
        throw new Error("Testimony not found");
      }

      // If the testimony exists, then return;
      if (testimony.approved) {
        return `Testimony already approved`;
      }

      // Approve testimony
      testimony.approved = true;
      await testimony.save();

      return `Testimony has been approved`;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error approving Testimony");
    }
  }

  public async deleteTestimony(
    testimonyId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Ensure that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Establish that the testimony exists
      const testimony = await this.testimonyModel.findById(testimonyId);
      if (!testimony) {
        throw new Error("Testimony does not exist");
      }

      // Ascertain that this is the admin or the testimony creator
      if (user.userType !== "admin" && String(testimony.userId) !== userId) {
        throw new Error("You are not permitted to delete this Testimony");
      }

      // If the testimony is already approved, then only the admin should be able to delete
      if (testimony.approved && user.userType !== "admin") {
        throw new Error("Only an admin can delete an approved testimony");
      }

      // Now delete the Testimony
      await this.testimonyModel.findByIdAndDelete(testimonyId);

      return "Testimony has been successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Testimony");
    }
  }

  public async fetchUserTestimonies(userId: string): Promise<object | Error> {
    try {
      // Establish that the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User does not exist");
      }

      const testimonies = await this.testimonyModel.find({ userId }).populate({
        path: "userId",
        model: this.userModel,
        select: "_id username firstName lastName",
      });

      return testimonies;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching user's Testimonies");
    }
  }

  public async fetchTestimonies(
    queryOptions: FetchTestimoniesInterface,
    userId: string
  ): Promise<object | Error> {
    const { searchQuery, filter, page, pageSize, approved } = queryOptions;
    try {
      // Design the filtering strategy
      const query: FilterQuery<typeof this.testimonyModel> = {};
      // Search for the provided searchQuery in the statement and profession fields
      if (searchQuery) {
        query.$or = [
          { statement: { $regex: new RegExp(searchQuery, "i") } },
          { profession: { $regex: new RegExp(searchQuery, "i") } },
        ];
      }

      // Only admins should have the option of querying unapproved Testimony
      if (userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        if (user.userType !== "admin") {
          query.approved = true;
        } else {
          if (approved) {
            query.approved = approved === "true";
          }
        }
      }

      // Define the sorting strategy
      let sortingOptions = {};
      switch (filter) {
        case "newest":
          sortingOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortingOptions = { createdAt: 1 };
          break;
        default:
          sortingOptions = { createdAt: -1 };
          break;
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const testimonies = await this.testimonyModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "_id username firstName lastName",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortingOptions);

      // Find out if there is a next page
      const totalTestimonies = await this.testimonyModel.countDocuments(query);
      const isNext = totalTestimonies > skipAmount + testimonies.length;

      return { testimonies, isNext };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Testimonies");
    }
  }
}

export default TestimonyService;
