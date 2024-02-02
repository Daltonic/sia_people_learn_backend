import User from "@/resources/user/user.model";
import Course, { ICourse } from "@/resources/course/course.model";
import {
  CreateCourseInterface,
  FetchCoursesInterface,
  OrderLessonInterface,
  UpdateCourseInterface,
} from "@/resources/course/course.interface";
import log from "@/utils/logger";
import Tag from "@/resources/tag/tag.model";
import Lesson from "@/resources/lesson/lesson.model";
import { FilterQuery, Types } from "mongoose";
import Review from "@/resources/review/review.model";
import sendEmail, { generateEmail } from "@/utils/mailer";
import {
  productApprovalFeedback,
  productApprovalRequestMail,
} from "@/utils/templates/mails";

class CourseService {
  private userModel = User;
  private courseModel = Course;
  private tagModel = Tag;
  private lessonModel = Lesson;
  private reviewModel = Review;

  public async createCourse(
    courseInput: CreateCourseInterface,
    userId: string
  ): Promise<object | Error> {
    const {
      name,
      price,
      description,
      overview,
      difficulty,
      tags,
      imageUrl,
      highlights,
      requirements,
      type,
    } = courseInput;
    try {
      // Check the type of Course. If its a course, then highlights, requirements and difficulty must be provided.
      if (type === "Course") {
        let missingData = false;
        let message = "";
        if (!difficulty) {
          message += "Course Difficulty is required. ";
          missingData = true;
        }

        if (!requirements) {
          message += "Course Requirements is required. ";
          missingData = true;
        }

        if (!highlights) {
          message += "Course Highlights is required. ";
        }

        if (missingData) {
          throw new Error(message);
        }
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("Content creator not found");
      }

      // Get the newCourse object;
      let courseData: object;
      if (type === "Course") {
        courseData = {
          name,
          price,
          type,
          description,
          overview,
          difficulty,
          userId,
          requirements,
          highlights,
          tags,
          imageUrl: imageUrl || null,
        };
      } else {
        courseData = {
          name,
          price,
          description,
          overview,
          userId,
          tags,
          type,
          imageUrl: imageUrl || null,
        };
      }

      const newCourse = await this.courseModel.create(courseData);

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
      throw new Error(e.message || "Error creating course");
    }
  }

  public async updateCourse(
    updateCourseInput: UpdateCourseInterface["body"],
    courseId: string,
    userId: string
  ): Promise<object | Error> {
    const {
      name,
      description,
      overview,
      price,
      imageUrl,
      difficulty,
      tags,
      highlights,
      requirements,
      type,
    } = updateCourseInput;

    try {
      //Ensure that this is a valid user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      // Only a course creator should be able to update the course
      if (user.userType !== "admin" && String(course.userId) !== userId) {
        throw new Error("You are not allowed to updated this course");
      }

      // Check if the tags Document exist, otherwise, create new tags
      const tagDocumentIds: string[] = [];
      if (tags) {
        for (const tag of tags) {
          const existingTag = await this.tagModel.findOne({
            name: { $regex: new RegExp(`${tag}$`, "i") },
          });

          // If the tag already exists and the current course has been assigned the tag, then do nothing
          if (existingTag && existingTag.courses.includes(course._id)) {
            tagDocumentIds.push(existingTag._id);
            continue;
          }

          // Otherwise, create the tag.
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, "i") } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { courses: course._id },
            },
            { upsert: true, new: true }
          );
          tagDocumentIds.push(_tag._id);
        }
      }

      let updateData: object;
      if (type === "Course") {
        updateData = {
          name: name || course.name,
          description: description || course.description,
          overview: overview || course.overview,
          price: price || course.price,
          imageUrl: imageUrl || course.imageUrl,
          difficulty: difficulty || course.difficulty,
          highlights: highlights || course.highlights,
          requirements: requirements || course.requirements,
          tags: tagDocumentIds,
        };
      } else {
        updateData = {
          name: name || course.name,
          description: description || course.description,
          overview: overview || course.overview,
          price: price || course.price,
          imageUrl: imageUrl || course.imageUrl,
          tags: tagDocumentIds,
        };
      }

      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true }
      );

      return updatedCourse!;
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
        throw new Error("Only the course instructor can delete this course");
      }

      // Delete the course from the user document
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { courses: course._id } },
        { new: true }
      );

      // Now delete the course document
      await this.courseModel.findByIdAndUpdate(
        courseId,
        { deleted: true },
        { new: true }
      );

      return "Course successfully deleted";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error deleting Course");
    }
  }

  public async fetchCourse(courseId: string): Promise<ICourse | Error> {
    try {
      const course = await this.courseModel
        .findById(courseId)
        // .populate({
        //   path: "tags",
        //   model: this.tagModel,
        //   select: "_id name",
        // })
        .populate({
          path: "lessons",
          model: this.lessonModel,
          options: { sort: { order: 1 } },
          select: "_id title",
        })
        .populate({
          path: "userId",
          model: this.userModel,
          select: "firstName lastName username imgUrl",
        })
        .populate({
          path: "reviews",
          model: this.reviewModel,
          match: { deleted: false },
          select: "starRating comment",
          populate: {
            path: "userId",
            model: this.userModel,
            select: "firstName lastName username",
          },
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

  public async fetchCourses(
    queryOptions: FetchCoursesInterface,
    userId: string
  ): Promise<object | Error> {
    const {
      page,
      pageSize,
      searchQuery,
      filter,
      difficulty,
      deleted,
      instructor,
      type,
    } = queryOptions;
    try {
      // Design the filtering strategy
      const query: FilterQuery<typeof this.courseModel> = {};
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

      if (instructor) {
        query.userId = new Types.ObjectId(instructor);
      }

      if (type) {
        query.type = type;
      }

      // Non admins can only view approved and non-deleted courses
      // Admin can view both approved and unapproved courses. They can also view deleted academies and filter by deleted
      if (!userId) {
        query.approved = true;
        query.deleted = false;
      } else {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        if (user.userType === "user") {
          query.approved = true;
          query.deleted = false;
        } else if (user.userType === "instructor") {
          query.deleted = false;
        } else {
          if (deleted) {
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

      const courses = await this.courseModel
        .find(query)
        .populate({
          path: "userId",
          model: this.userModel,
          select: "firstName lastName username",
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions)
        .select(
          "name price description overview difficulty duration lessonsCount rating reviewsCount requirements highlights approved deleted"
        );

      // Find out if there is a next page
      const totalCourses = await this.courseModel.countDocuments(query);
      const isNext = totalCourses > skipAmount + courses.length;
      const numOfPages = Math.ceil(totalCourses / numericPageSize);
      return { courses, isNext, numOfPages };
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

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (String(course.userId) !== userId) {
        throw new Error("User not authorised");
      }

      if (course.approved) {
        return "Course already approved";
      }

      course.submitted = submitted;

      await course.save();

      // Notify the admin
      // Fetch the admins for the purpose of email notification
      const admins = await this.userModel.find({ userType: "admin" });

      if (admins.length === 0) {
        throw new Error(
          "There are currently no Admins to approve this request"
        );
      }

      const emails: string[] = [];
      for (let admin of admins) {
        emails.push(admin.email);
      }

      const productApprovalMail = await generateEmail(
        {
          firstname: user.firstName,
          lastname: user.lastName,
          productType: course.type,
          title: course.name,
          link: process.env.SOCIAL_REDIRECT_URL,
        },
        productApprovalRequestMail
      );

      const mailSendSuccess = await sendEmail(
        emails,
        productApprovalMail,
        "Product Approval Request"
      );

      if (mailSendSuccess) {
        log.info("Approval mail successfully sent");
      } else {
        log.info("Approval mail could not be sent");
      }

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

      const user = await this.userModel.findById(String(course.userId));
      if (!user) {
        throw new Error("User not found");
      }

      const userUpgradeSuccessMail = await generateEmail(
        {
          name: user.firstName,
          productType: course.type,
          title: course.name,
          link: process.env.SOCIAL_REDIRECT_URL,
          status: course.approved ? "approved" : "rejected",
        },
        productApprovalFeedback
      );

      const mailSendSuccess = await sendEmail(
        user.email,
        userUpgradeSuccessMail,
        "Product Approval Feedback"
      );

      if (mailSendSuccess) {
        return `Request approval mail successfully sent`;
      } else {
        return "Error sending success notification request";
      }
    } catch (e: any) {
      log.error(e.message);
      throw new Error("Error submitting Course");
    }
  }

  public async orderLessons(
    courseId: string,
    lessonsData: OrderLessonInterface["body"],
    userId: string
  ): Promise<string | Error> {
    const { lessonsIds } = lessonsData;

    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (String(course.userId) !== userId) {
        throw new Error("Only course owner can order lessons");
      }

      lessonsIds.map(async (lessonId, index) => {
        await this.lessonModel.findByIdAndUpdate(
          lessonId,
          { order: index },
          { new: true }
        );
      });

      return "Lessons successfully reordered";
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error ordering lessons");
    }
  }
}

export default CourseService;
