import sendEmail, { generateEmail } from "@/utils/mailer";
import { SendMessageInterface } from "./message.interface";
import { contactMessage } from "@/utils/templates/mails";
import log from "@/utils/logger";

class MessageService {
  public async sendMessage(
    messageInput: SendMessageInterface
  ): Promise<void | Error> {
    const { email, message, name } = messageInput;

    try {
      const contactMail = await generateEmail(
        { name, email, message },
        contactMessage
      );

      const mailSendSuccess = await sendEmail(
        "emma.osademe@gmail.com",
        contactMail,
        "Contact Message"
      );

      if (!mailSendSuccess) {
        throw new Error("Error sending message");
      }
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error sending message");
    }
  }
}

export default MessageService;
