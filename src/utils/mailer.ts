import nodemailer from "nodemailer";
import * as fs from "fs";
import log from "./logger";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  debug: true,
  auth: {
    user: "emmyshoppinghub@gmail.com",
    pass: "bzrrpahmedhatnkr",
  },
  tls: {
    rejectUnauthorized: true,
  },
});

export default async function sendEmail(
  recipient: string | Array<string>,
  body: string,
  subject: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      to: recipient,
      from: `"Dapp Mentors" <notification@dappmentors.com>`,
      html: body,
      subject,
    });
    return true;
  } catch (e: any) {
    log.error(e.message);
    return false;
  }
}

export const generateEmail = async (data: any, templateName: string) => {
  let templateContent = fs
    .readFileSync(path.resolve("./src/utils/templates/mails/", templateName))
    .toLocaleString();
  for (let key in data) {
    templateContent = templateContent.replace("{{" + key + "}}", data[key]);
  }
  return templateContent;
};
