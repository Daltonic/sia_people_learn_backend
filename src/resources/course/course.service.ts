import User from "@/resources/user/user.model";
import Course from "@/resources/course/course.model";
import {
  CreateCourseInterface,
  UpdateCourseInterface,
} from "@/resources/course/course.interface";
import log from "@/utils/logger";
import Tag from "@/resources/tag/tag.model";
import Lesson from "@/resources/lesson/lesson.model";

class CourseService {
  private userModel = User;
  private courseModel = Course;
  private tagModel = Tag;
  private lessonModel = Lesson;

  public async createCourse(
    courseInput: CreateCourseInterface,
    userId: string
  ): Promise<object | Error> {
    const { name, price, description, overview, difficulty, tags, imageUrl } =
      courseInput;
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("Content creator not found");
      }

      const newCourse = await this.courseModel.create({
        name,
        price,
        description,
        overview,
        difficulty,
        userId,
        imageUrl: imageUrl || null,
      });

      // Get the tags if they exist, otherwise, create the tags
      const tagDocumentIds = [];
      if (tags) {
        for (const tag of tags) {
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, "i") } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { academies: newCourse._id },
            },
            { upsert: true, new: true }
          );

          tagDocumentIds.push(_tag._id);
        }
      }

      // Now add the tags to the academy document
      await this.courseModel.findByIdAndUpdate(newCourse._id, {
        $push: { tags: { $each: tagDocumentIds } },
      });

      // Update user with the course content to allow for seamless querying
      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { courses: newCourse._id } },
        { new: true }
      );

      return newCourse;
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error creating course");
    }
  }

  public async updateCourse(
    updateCourseInput: UpdateCourseInterface["body"],
    courseId: string,
    userId: string
  ): Promise<object | Error> {
    const { name, description, overview, price, imageUrl, difficulty, tags } =
      updateCourseInput;

    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Only a course creator should be able to update the course
      if (String(course.userId) !== userId) {
        throw new Error("You are not allowed to updated this course");
      }

      if (name) {
        course.name = name;
      }

      if (description) {
        course.description = description;
      }

      if (overview) {
        course.overview = overview;
      }

      if (price) {
        course.price = price;
      }

      if (imageUrl) {
        course.imageUrl = imageUrl;
      }

      if (difficulty) {
        course.difficulty = difficulty;
      }

      if (tags) {
        course.tags = tags;
      }

      // Now save the updated course
      const updatedCourse = await course.save();
      return updatedCourse;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message);
    }
  }

  public async deleteCourse(
    courseId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (String(course.userId) !== userId) {
        throw new Error("You are not authorised to delete this course");
      }

      // Delete the course from the user document
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { courses: course._id } },
        { new: true }
      );

      // Now delete the course document
      await this.courseModel.findByIdAndDelete(courseId);

      // todo: Remember to delete course from academy when academy model is created
      return "Course successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Course");
    }
  }

  public async fetchCourse(courseId: string): Promise<object | Error> {
    try {
      const course = await this.courseModel
        .findById(courseId)
        .populate({
          path: "tags",
          model: this.tagModel,
          select: "_id name",
        })
        .populate({
          path: "lessons",
          model: this.lessonModel,
          select: "_id title",
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "firstName lastName username",
        });
      if (!course) {
        throw new Error("Course not found");
      }

      return course;
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error fetching Course");
    }
  }

  public async fetchCourses(): Promise<object | Error> {
    try {
      //todo: Implement search and filter features
      const courses = this.courseModel
        .find({})
        .populate({
          path: "lessons",
          model: this.lessonModel,
          select: "_id title",
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
        });
      return courses;
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error fetching Courses");
    }
  }

  public async submitCourse(
    courseId: string,
    userId: string,
    submitted: boolean
  ): Promise<string | Error> {
    try {
      const course = await this.courseModel.findById(courseId);

      if (!course) {
        throw new Error("Course not found");
      }

      if (String(course.userId) !== userId) {
        throw new Error("User not authorised");
      }

      if (course.approved) {
        return "Course already approved";
      }

      course.submitted = submitted;

      await course.save();

      return "Course has been submitted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error submitting Course");
    }
  }

  public async approveCourse(courseId: string): Promise<string | Error> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.approved) {
        return "Course already approved";
      }

      course.approved = true;
      await course.save();

      return "Course has been approved";
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error submitting Course");
    }
  }
}

export default CourseService;
