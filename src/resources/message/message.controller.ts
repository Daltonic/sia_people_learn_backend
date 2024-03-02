import Controller from "@/utils/interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from "express";
import MessageService from "./message.service";
import validateResource from "@/middlewares/validation.middleware";
import { sendMessageSchema } from "./message.validation";
import { SendMessageInterface } from "./message.interface";
import HttpException from "@/utils/exceptions/HttpException";
import { StatusCodes } from "http-status-codes";

class MessageController implements Controller {
  public path = "/messages";
  public router = Router();

  private messageService = new MessageService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    this.router.post(
      `${this.path}/send`,
      validateResource(sendMessageSchema),
      this.sendMessage
    );
  }

  private sendMessage = async (
    req: Request<{}, {}, SendMessageInterface>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const input = req.body;
    try {
      await this.messageService.sendMessage(input);
      res.status(StatusCodes.OK).send("Message sent");
    } catch (e: any) {
      next(new HttpException(StatusCodes.BAD_REQUEST, e.message));
    }
  };
}

export default MessageController;
