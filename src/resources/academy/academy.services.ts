import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import Academy from "@/resources/academy/academy.model";
import {
  CreateAcademyInterface,
  UpdateAcademyInterface,
} from "@/resources/academy/academy.interface";
import { log } from "@/utils/index";
import Tag from "@/resources/tag/tag.model";

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
      whatToLearn,
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
        whatToLearn: whatToLearn || [],
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
      whatToLearn,
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
        throw new Error("User not authorised");
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
      await this.academyModel.findByIdAndUpdate(
        academyId,
        {
          name: name || academy.name,
          description: description || academy.description,
          overview: overview || academy.overview,
          imageUrl: imageUrl || academy.imageUrl,
          price: price || academy.price,
          difficulty: difficulty || academy.difficulty,
          highlights: highlights || academy.highlights,
          whatToLearn: whatToLearn || academy.whatToLearn,
          duration: cumulativeDuration,
          courses: coursesFound,
          tags: tagDocumentIds,
        },
        { new: true }
      );

      return { academy, coursesNotFound };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating Academy");
    }
  }

  public async fetchAcademy(academyId: string): Promise<object | Error> {
    try {
      const academy = await this.academyModel.findById(academyId);
      if (!academy) {
        throw new Error("Academy not found");
      }

      return academy;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching academy");
    }
  }

  public async fetchAcademies(): Promise<object | Error> {
    try {
      // todo: Implement search and filter features
      const academies = await this.courseModel.find({});
      return academies;
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error fetching Academies");
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
        throw new Error("User not authorised");
      }

      await this.academyModel.findByIdAndDelete(academyId);
      return "Academy has been successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting academy");
    }
  }
}

export default AcademyService;
