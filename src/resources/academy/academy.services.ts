import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import Academy from "@/resources/academy/academy.model";
import {
  CreateAcademyInterface,
  FetchAcademiesInterface,
  UpdateAcademyInterface,
} from "@/resources/academy/academy.interface";
import { log } from "@/utils/index";
import Tag from "@/resources/tag/tag.model";
import { FilterQuery } from "mongoose";

class AcademyService {
  private userModel = User;
  private courseModel = Course;
  private academyModel = Academy;
  private tagModel = Tag;

  public async createAcademy(
    academyInput: CreateAcademyInterface,
    userId: string
  ): Promise<object | Error> {
    const {
      name,
      description,
      overview,
      imageUrl,
      price,
      validity,
      difficulty,
      highlights,
      requirements,
      tags,
      courses,
    } = academyInput;
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("Content creator not found");
      }

      // Create the Academy
      const academy = await this.academyModel.create({
        name,
        description,
        overview,
        price,
        difficulty,
        imageUrl: imageUrl || null,
        validity: validity || 0,
        highlights: highlights || [],
        requirements: requirements || [],
        userId: userId,
      });

      // Get the tags if they exist, otherwise, create the tags
      const tagDocumentIds = [];
      if (tags) {
        for (const tag of tags) {
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, "i") } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { academies: academy._id },
            },
            { upsert: true, new: true }
          );

          tagDocumentIds.push(_tag._id);
        }
      }

      // Now add the tags to the academy document
      await this.academyModel.findByIdAndUpdate(academy._id, {
        $push: { tags: { $each: tagDocumentIds } },
      });

      // Add the courses to the academy if the courses do exist
      const coursesNotFound = [];
      const coursesFound = [];
      let cumulativeDuration = 0;
      if (courses) {
        for (let course of courses) {
          const _course = await this.courseModel.findById(course);
          if (_course && String(_course.userId) === userId) {
            coursesFound.push(_course._id);
            cumulativeDuration += _course.duration;
          } else {
            coursesNotFound.push(course);
          }
        }
      }

      // Now add the courses that were found to the academy document
      await this.academyModel.findByIdAndUpdate(academy._id, {
        duration: cumulativeDuration,
        $push: { courses: { $each: coursesFound } },
      });

      return { academy, coursesNotFound };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error creating course");
    }
  }

  public async updateAcademy(
    academyInput: UpdateAcademyInterface["body"],
    academyId: string,
    userId: string
  ): Promise<object | Error> {
    const {
      name,
      description,
      overview,
      imageUrl,
      price,
      difficulty,
      highlights,
      requirements,
      tags,
      courses,
    } = academyInput;
    try {
      const academy = await this.academyModel.findById(academyId);
      if (!academy) {
        throw new Error("Academy not found");
      }

      // Only academy owner should be able to update the academy data
      if (String(academy.userId) !== userId) {
        throw new Error("You are not allowed to update this academy");
      }

      // Check if the tags Document exist, otherwise, create the documents. The new documents will be used to override any existing tags for the academy
      const tagDocumentIds: string[] = [];
      if (tags) {
        for (const tag of tags) {
          const existingTag = await this.tagModel.findOne({
            name: { $regex: new RegExp(`^${tag}$`, "i") },
          });
          // If the tag already exists and the current academy has been assigned the tag, then do nothing
          if (existingTag && existingTag.academies.includes(academy._id)) {
            tagDocumentIds.push(existingTag._id);
            continue;
          }
          // Otherwise, confirm that the tag exists
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, "i") } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { academies: academy._id },
            },
            { upsert: true, new: true }
          );

          tagDocumentIds.push(_tag._id);
        }
      }

      // The courses are to be overwritten. Hence, we expect all the courses, including the original courses
      const coursesNotFound = [];
      const coursesFound = [];
      let cumulativeDuration = 0;
      if (courses) {
        for (let course of courses) {
          const _course = await this.courseModel.findById(course);
          if (_course && String(_course.userId) === userId) {
            coursesFound.push(_course._id);
            cumulativeDuration += _course.duration;
          } else {
            coursesNotFound.push(course);
          }
        }
      }

      // Update the document
      const updatedAcademy = await this.academyModel.findByIdAndUpdate(
        academyId,
        {
          name: name || academy.name,
          description: description || academy.description,
          overview: overview || academy.overview,
          imageUrl: imageUrl || academy.imageUrl,
          price: price || academy.price,
          difficulty: difficulty || academy.difficulty,
          highlights: highlights || academy.highlights,
          requirements: requirements || academy.requirements,
          duration: cumulativeDuration,
          courses: coursesFound,
          tags: tagDocumentIds,
        },
        { new: true }
      );

      return { updatedAcademy, coursesNotFound };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating Academy");
    }
  }

  public async fetchAcademy(academyId: string): Promise<object | Error> {
    try {
      const academy = await this.academyModel
        .findById(academyId)
        .populate({
          path: "tags",
          model: this.tagModel,
          select: "_id name",
        })
        .populate({
          path: "courses",
          model: this.courseModel,
          select: "_id name",
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "firstName lastName username",
        });
      if (!academy) {
        throw new Error("Academy not found");
      }

      return academy;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching academy");
    }
  }

  public async fetchAcademies(
    queryOptions: FetchAcademiesInterface,
    userId: string
  ): Promise<object | Error> {
    const { page, pageSize, searchQuery, filter, difficulty, deleted } =
      queryOptions;
    try {
      // Design the filtering strategy
      const query: FilterQuery<typeof this.academyModel> = {};
      // Search for the searchQuery in the name, overview and description field
      if (searchQuery) {
        query.$or = [
          { name: { $regex: new RegExp(searchQuery, "i") } },
          { overview: { $regex: new RegExp(searchQuery, "i") } },
          { description: { $regex: new RegExp(searchQuery, "i") } },
        ];
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Non admins can only view approved and non-deleted academies
      // Admin can view both approved and unapproved academies. They can also view deleted academies and filter by deleted
      if (!userId) {
        query.approved = true;
        query.deleted = false;
      } else {
        const user = await this.userModel.findById(userId);

        if (!user) {
          throw new Error("User not found");
        }
        if (user.userType !== "admin") {
          query.approved = true;
          query.deleted = false;
        } else {
          if (deleted) {
            console.log(deleted);
            query.deleted = deleted === "true";
          }
        }
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
        case "recommended":
          //todo: Decide on a recommendation algorithm
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1; // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 10; // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize;

      const academies = await this.academyModel
        .find(query)
        .populate({
          path: "courses",
          model: this.courseModel,
          select: "_id name",
          strictPopulate: false,
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "firstName lastName username",
        })
        .populate({
          path: "tags",
          model: this.tagModel,
          select: "_id name",
          strictPopulate: false,
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions);

      // Find out if there is a next page
      const totalAcademies = await this.academyModel.countDocuments(query);
      const isNext = totalAcademies > skipAmount + academies.length;
      return { academies, isNext };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching Academies");
    }
  }

  public async submitAcademy(
    academyId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId);
      if (!academy) {
        throw new Error("Academy not found");
      }

      if (String(academy.userId) !== userId) {
        throw new Error("User not authorised");
      }

      if (academy.submitted) {
        return "Academy already submitted for approval";
      }

      academy.submitted = true;
      await academy.save();

      return "Academy has been successfully submitted for approval";
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error submitting Course");
    }
  }

  public async approveAcademy(academyId: string): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId);
      if (!academy) {
        throw new Error("Academy not found");
      }

      if (academy.approved) {
        return "Academy already approved";
      }

      academy.approved = true;
      await academy.save();
      return "Academy has been approved.";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error approving academy");
    }
  }

  public async deleteAcademy(
    academyId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId);
      if (!academy) {
        throw new Error("Academy not found");
      }

      if (String(academy.userId) !== userId) {
        throw new Error("Only the academy instructor can delete this academy");
      }

      if (academy.deleted) {
        return "Academy already deleted";
      }

      await this.academyModel.findByIdAndUpdate(
        academyId,
        { deleted: true },
        { new: true }
      );
      return "Academy has been successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting academy");
    }
  }
}

export default AcademyService;
