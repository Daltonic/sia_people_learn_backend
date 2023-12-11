import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import Academy from "@/resources/academy/academy.model";
import { CreateAcademyInterface } from "@/resources/academy/academy.interface";
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
}

export default AcademyService;
