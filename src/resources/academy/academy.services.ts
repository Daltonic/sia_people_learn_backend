import User from '@/resources/user/user.model'
import Course from '@/resources/course/course.model'
import Academy, { IAcademy } from '@/resources/academy/academy.model'
import {
  CreateAcademyInterface,
  FetchAcademiesInterface,
  UpdateAcademyInterface,
} from '@/resources/academy/academy.interface'
import { log } from '@/utils/index'
import Tag from '@/resources/tag/tag.model'
import { FilterQuery, Types } from 'mongoose'
import Review from '@/resources/review/review.model'
import sendEmail, { generateEmail } from '@/utils/mailer'
import {
  productApprovalFeedback,
  productApprovalRequestMail,
  productDeletionFeedback,
} from '@/utils/templates/mails'
import StripeService from '@/resources/processors/stripe.service'
import { ProductItem } from '../processors/processors.interface'

class AcademyService {
  private userModel = User
  private courseModel = Course
  private academyModel = Academy
  private tagModel = Tag
  private reviewModel = Review
  private processors = new StripeService()

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
    } = academyInput
    try {
      const user = await this.userModel.findById(userId)
      if (!user) {
        throw new Error('Content creator not found')
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
      })

      // Get the tags if they exist, otherwise, create the tags
      const tagDocumentIds = []
      if (tags) {
        for (const tag of tags) {
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { academies: academy._id },
            },
            { upsert: true, new: true }
          )

          tagDocumentIds.push(_tag._id)
        }
      }

      // Now add the tags to the academy document
      await this.academyModel.findByIdAndUpdate(academy._id, {
        $push: { tags: { $each: tagDocumentIds } },
      })

      // Add the courses to the academy if the courses do exist
      const coursesNotFound = []
      const coursesFound = []
      let cumulativeDuration = 0
      if (courses) {
        for (let course of courses) {
          const _course = await this.courseModel.findById(course)
          if (_course && String(_course.userId) === userId) {
            coursesFound.push(_course._id)
            cumulativeDuration += _course.duration
          } else {
            coursesNotFound.push(course)
          }
        }
      }

      // Now add the courses that were found to the academy document
      await this.academyModel.findByIdAndUpdate(academy._id, {
        duration: cumulativeDuration,
        $push: { courses: { $each: coursesFound } },
      })

      // Create a product on stripe if the validity of this academy is greater than zero
      const product: ProductItem = {
        name: String(academy.name),
        productId: String(academy.id),
        image: String(academy.imageUrl),
        amount: Number(academy.price),
        interval: academy.validity,
      }

      if (academy.validity > 0) {
        const productItem = await this.processors.manageProduct(product)
        const ref = productItem.product

        await this.academyModel.findByIdAndUpdate(academy._id, {
          ref: ref,
        })
      }

      return { academy, coursesNotFound }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error creating course')
    }
  }

  public async updateAcademy(
    academyInput: UpdateAcademyInterface['body'],
    academyId: string,
    userId: string
  ): Promise<object | Error> {
    console.log(academyInput);
    console.log(academyId);
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
    } = academyInput
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      // Only academy owner should be able to update the academy data
      if (String(academy.userId) !== userId) {
        throw new Error('You are not allowed to update this academy')
      }

      // Check if the tags Document exist, otherwise, create the documents. The new documents will be used to override any existing tags for the academy
      const tagDocumentIds: string[] = []
      if (tags) {
        for (const tag of tags) {
          const existingTag = await this.tagModel.findOne({
            name: { $regex: new RegExp(`^${tag}$`, 'i') },
          })
          // If the tag already exists and the current academy has been assigned the tag, then do nothing
          if (existingTag && existingTag.academies.includes(academy._id)) {
            tagDocumentIds.push(existingTag._id)
            continue
          }
          // Otherwise, confirm that the tag exists
          const _tag = await this.tagModel.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
            {
              $setOnInsert: { name: tag.toUpperCase() },
              $push: { academies: academy._id },
            },
            { upsert: true, new: true }
          )

          tagDocumentIds.push(_tag._id)
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
          validity: validity || academy.validity,
          difficulty: difficulty || academy.difficulty,
          highlights: highlights || academy.highlights,
          requirements: requirements || academy.requirements,
          tags: tagDocumentIds,
        },
        { new: true }
      )

      const product: ProductItem = {
        name: String(name),
        ref: String(academy.ref),
        productId: String(academy.id),
        image: String(imageUrl),
        amount: Number(price),
        interval: Number(validity) || 0,
      }

      if (validity && validity > 0) {
        await this.processors.manageProduct(product)
      }

      return updatedAcademy!
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error updating Academy')
    }
  }

  public async fetchAcademy(academyId: string): Promise<IAcademy | Error> {
    try {
      const academy = await this.academyModel
        .findById(academyId)
        .populate({
          path: 'tags',
          model: this.tagModel,
          select: '_id name',
        })
        .populate({
          path: 'courses',
          model: this.courseModel,
          select: '_id name imageUrl',
        })
        .populate({
          path: 'userId',
          model: this.userModel,
          select: 'firstName lastName username',
        })
        .populate({
          path: 'reviews',
          model: this.reviewModel,
          match: { deleted: false },
          select: 'starRating comment',
          populate: {
            path: 'userId',
            model: this.userModel,
            select: 'firstName lastName username imgUrl',
          },
        })
      if (!academy) {
        throw new Error('Academy not found')
      }

      return academy
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error fetching academy')
    }
  }

  public async fetchAcademies(
    queryOptions: FetchAcademiesInterface,
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
    } = queryOptions
    try {
      // Design the filtering strategy
      const query: FilterQuery<typeof this.academyModel> = {}
      // Search for the searchQuery in the name, overview and description field
      if (searchQuery) {
        query.$or = [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { overview: { $regex: new RegExp(searchQuery, 'i') } },
          { description: { $regex: new RegExp(searchQuery, 'i') } },
        ]
      }

      if (difficulty) {
        query.difficulty = difficulty
      }

      if (instructor === "true") {
        query.userId = userId;
      }

      // Non admins can only view approved and non-deleted academies
      // Admin can view both approved and unapproved academies. They can also view deleted academies and filter by deleted
      if (!userId) {
        query.approved = true
        query.deleted = false
      } else {
        const user = await this.userModel.findById(userId)
        if (!user) {
          throw new Error('User not found')
        }
        if (user.userType === 'user') {
          query.approved = true
          query.deleted = false
        } else if (user.userType === 'instructor') {
          query.deleted = false
        } else {
          if (deleted) {
            query.deleted = deleted === 'true'
          }
        }
      }

      // Define the sorting strategy
      let sortOptions = {}
      switch (filter) {
        case 'newest':
          sortOptions = { createdAt: -1 }
          break
        case 'oldest':
          sortOptions = { createdAt: 1 }
          break
        case 'recommended':
          //todo: Decide on a recommendation algorithm
          break
        default:
          sortOptions = { createdAt: -1 }
          break
      }

      // Estimate the number of pages to skip based on the page number and size
      let numericPage = page ? Number(page) : 1 // Page number should default to 1
      let numericPageSize = pageSize ? Number(pageSize) : 1 // Page size should default to 10
      const skipAmount = (numericPage - 1) * numericPageSize

      const academies = await this.academyModel
        .find(query)
        .populate({
          path: 'userId',
          model: this.userModel,
          select: 'firstName lastName username',
        })
        .skip(skipAmount)
        .limit(numericPageSize)
        .sort(sortOptions)
        .select(
          'name description overview imageUrl price difficulty duration validity rating reviewsCount highlights requirements approved deleted'
        )

      // Find out if there is a next page
      const totalAcademies = await this.academyModel.countDocuments(query)
      const isNext = totalAcademies > skipAmount + academies.length
      const numOfPages = Math.ceil(totalAcademies / numericPageSize)
      return { academies, isNext, numOfPages }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error fetching Academies')
    }
  }

  public async submitAcademy(
    academyId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      const user = await this.userModel.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      if (String(academy.userId) !== userId) {
        throw new Error('User not authorised')
      }

      if (academy.submitted) {
        return 'Academy already submitted for approval'
      }

      academy.submitted = true
      await academy.save()

      // Fetch the admins for the purpose of email notification
      const admins = await this.userModel.find({ userType: 'admin' })

      if (admins.length === 0) {
        throw new Error('There are currently no Admins to approve this request')
      }

      const emails: string[] = []
      for (let admin of admins) {
        emails.push(admin.email)
      }

      const productApprovalMail = await generateEmail(
        {
          firstname: user.firstName,
          lastname: user.lastName,
          productType: 'Academy',
          title: academy.name,
          link: process.env.SOCIAL_REDIRECT_URL,
        },
        productApprovalRequestMail
      )

      const mailSendSuccess = await sendEmail(
        emails,
        productApprovalMail,
        'Product Approval Request'
      )

      if (mailSendSuccess) {
        log.info('Approval mail successfully sent')
      } else {
        log.info('Approval mail could not be sent')
      }

      return 'Academy has been successfully submitted for approval'
    } catch (e: any) {
      log.error(e.message)
      throw new Error('Error submitting Course')
    }
  }

  public async approveAcademy(academyId: string): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      if (academy.approved) {
        return 'Academy already approved'
      }

      academy.approved = true
      await academy.save()

      const user = await this.userModel.findById(String(academy.userId))
      if (!user) {
        throw new Error('User not found')
      }

      const productApprovalMail = await generateEmail(
        {
          name: user.firstName,
          productType: 'Academy',
          title: academy.name,
          link: process.env.SOCIAL_REDIRECT_URL,
          status: academy.approved ? 'approved' : 'rejected',
        },
        productApprovalFeedback
      )

      const mailSendSuccess = await sendEmail(
        user.email,
        productApprovalMail,
        'Product Approval Feedback'
      )

      if (mailSendSuccess) {
        return `Request approval mail successfully sent`
      } else {
        return 'Error sending success notification request'
      }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error approving academy')
    }
  }

  public async addCourse(
    academyId: string,
    courseId: string,
    userId: string
  ): Promise<object | Error> {
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      if (String(academy.userId) !== userId) {
        throw new Error(
          'Only academy instructor can add a course to this academy'
        )
      }

      const course = await this.courseModel.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      if (String(course.userId) !== userId) {
        throw new Error(
          'Only course instructor can add this course to an academy'
        )
      }

      if (academy.courses.includes(course._id)) {
        return academy
      }

      const updatedAcademy = await this.academyModel.findByIdAndUpdate(
        { _id: academyId },
        { $push: { courses: course._id }, $inc: { duration: course.duration } },
        { new: true }
      )

      return updatedAcademy!
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error adding course')
    }
  }

  public async removeCourse(
    academyId: string,
    courseId: string,
    userId: string
  ): Promise<object | Error> {
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      if (String(academy.userId) !== userId) {
        throw new Error(
          'Only academy instructor can remove a course to this academy'
        )
      }

      const course = await this.courseModel.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const updatedAcademy = await this.academyModel.findByIdAndUpdate(
        { _id: academyId },
        {
          $pull: { courses: course._id },
          $inc: { duration: -1 * course.duration },
        },
        { new: true }
      )

      return updatedAcademy!
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error adding course')
    }
  }

  public async deleteAcademy(
    academyId: string,
    userId: string
  ): Promise<string | Error> {
    try {
      const academy = await this.academyModel.findById(academyId)
      if (!academy) {
        throw new Error('Academy not found')
      }

      if (String(academy.userId) !== userId) {
        throw new Error('Only the academy instructor can delete this academy')
      }

      if (academy.deleted) {
        return 'Academy already deleted'
      }

      await this.academyModel.findByIdAndUpdate(
        academyId,
        { deleted: true },
        { new: true }
      )

      const user = await this.userModel.findById(String(academy.userId))
      if (!user) {
        throw new Error('User not found')
      }

      const productDeletionMail = await generateEmail(
        {
          name: user.firstName,
          productType: 'Academy',
          title: academy.name,
        },
        productDeletionFeedback
      )

      const mailSendSuccess = await sendEmail(
        user.email,
        productDeletionMail,
        'Product Approval Feedback'
      )

      if (mailSendSuccess) {
        return `Your product has been deleted. Please check your mail for additional information`
      } else {
        return 'Your product has been deleted'
      }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error deleting academy')
    }
  }
}

export default AcademyService
