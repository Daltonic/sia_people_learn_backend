import Lesson from "@/resources/lesson/lesson.model";
import Course from "@/resources/course/course.model";
import {
  CreateLessonInterface,
  UpdateLessonInterface,
} from "@/resources/lesson/lesson.interface";
import log from "@/utils/logger";
import Subscription from "@/resources/subscription/subscription.model";
import User from "../user/user.model";

class LessonService {
  private lessonModel = Lesson;
  private courseModel = Course;
  private subscriptionModel = Subscription;
  private userModel = User;

  public async createLesson(
    lessonInput: CreateLessonInterface,
    userId: string
  ): Promise<object | Error> {
    // Note: Course duration must be in minutes
    let {
      courseId,
      title,
      overview,
      description,
      duration,
      imageUrl,
      videoUrl,
      downloadableUrl,
      order,
    } = lessonInput;

    try {
      // Fetch course and verify that the user is the course creator
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.type === "Book") {
        throw new Error("Lessons cannot be assigned to a Book");
      }

      // Ensure that only the course creator can update the course
      if (String(course.userId) !== userId) {
        throw new Error(
          "User must be course instructor to create a lesson for this course"
        );
      }

      // Create the lesson
      const lesson = await this.lessonModel.create({
        courseId: courseId,
        title: title,
        overview: overview,
        description: description,
        duration: duration,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        downloadableUrl: downloadableUrl || null,
        order: order || 0,
      });

      // Update course model to capture this lesson
      await this.courseModel.findByIdAndUpdate(
        courseId,
        { $push: { lessons: lesson._id }, $inc: { duration: duration } },
        { new: true }
      );

      return lesson;
    } catch (e: any) {
      log.error(e.message);
      if (e.code && e.code === 11000) {
        e.message = `Duplicate value entered for ${Object.keys(
          e.keyValue
        )} field.`;
      }
      throw new Error(e.message || "Error creating lesson");
    }
  }

  public async updateLesson(
    lessonInput: UpdateLessonInterface["body"],
    lessonId: string,
    userId: string
  ): Promise<object | Error> {
    const {
      title,
      overview,
      description,
      duration,
      imageUrl,
      videoUrl,
      downloadableUrl,
      order,
    } = lessonInput;
    try {
      // Fetch the lesson
      const lesson = await this.lessonModel.findById(lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Fetch the course to which the lesson belongs
      const course = await this.courseModel.findById(lesson.courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Confirm that the current user is the course creator
      if (String(course.userId) !== userId) {
        throw new Error(
          "You must be the course instructor for this lesson to update the lesson"
        );
      }

      // If duration is available, update the course duration to reflect the current time
      if (duration) {
        await this.courseModel.findByIdAndUpdate(
          lesson.courseId,
          { $inc: { duration: duration - lesson.duration } },
          { new: true }
        );
      }

      // Now update the lesson
      const updatedLesson = await this.lessonModel.findByIdAndUpdate(
        lessonId,
        {
          title: title || lesson.title,
          overview: overview || lesson.overview,
          description: description || lesson.description,
          duration: duration || lesson.duration,
          imageUrl: imageUrl || lesson.imageUrl,
          videoUrl: videoUrl || lesson.videoUrl,
          downloadableUrl: downloadableUrl || lesson.downloadableUrl,
          order: order || lesson.order,
        },
        { new: true }
      );

      return updatedLesson!;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error updating lesson");
    }
  }

  public async deleteLesson(
    lessonId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      // Fetch the lesson using the lessonId

      const lesson = await this.lessonModel.findById(lessonId);

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Fetch the course to which the lesson belongs
      const course = await this.courseModel.findById(lesson.courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Ensure that only the lesson creator can delete this lesson
      if (String(course.userId) !== userId) {
        throw new Error("You are not authorised to delete this lesson");
      }

      // Reduced the lesson duration from the course duration and remove the lessons Id from lessons in the course model
      await this.courseModel.findByIdAndUpdate(
        lesson.courseId,
        {
          $pull: { lessons: lesson._id },
          $inc: { duration: -1 * lesson.duration },
        },
        { new: true }
      );

      // Now delete the lesson
      await this.lessonModel.findByIdAndDelete(lessonId);

      return "Lesson successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Lesson");
    }
  }

  public async fetchLesson(
    lessonId: string,
    userId: string,
    subscriptionId?: string
  ): Promise<object | Error> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const lesson = await this.lessonModel.findById(lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Fetch the course and use it to check if current user is the course own
      const course = await this.courseModel.findById(lesson.courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // If this is not the course owner, then subscription ID is required to access this product
      if (String(course.userId) !== userId) {
        if (!subscriptionId) {
          throw new Error("Subscription ID is required.");
        }

        // Check that the subscription exists
        const subscription =
          await this.subscriptionModel.findById(subscriptionId);
        if (!subscription) {
          throw new Error("Invalid subscription");
        }

        // Check that the subscription has not expired
        if (
          subscription.status !== "Completed" ||
          subscription.expiresAt < new Date(Date.now())
        ) {
          throw new Error("User does not have a valid subscription");
        }

        // Check that the subscription belongs to this user
        if (String(subscription.userId) !== userId) {
          throw new Error("Invalid subscription");
        }
      }

      return lesson;
    } catch (e: any) {
      log.info(e.message);
      throw new Error(e.message || "Error fetching lesson");
    }
  }

  public async fetchLessons(courseId: string): Promise<object | Error> {
    try {
      // todo: Filtering and sorting features
      const lessons = await this.lessonModel
        .find({ courseId })
        .sort({ order: 1 });
      return lessons;
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error fetching lessons");
    }
  }
}

export default LessonService;
