require("dotenv").config();
import log from "@/utils/logger";
import axios from "axios";
import { FileUpload } from "./media.interface";

class SiaService {
  private siaBucket: string;
  private siaUrl: string;
  private siaPassword: string;

  constructor() {
    this.siaBucket = String(process.env.SIA_BUCKET);
    this.siaUrl = String(process.env.SIA_BASE_URL);
    this.siaPassword = String(process.env.SIA_API_PASSWORD);
  }

  public async uploadFile(file: FileUpload): Promise<object | Error> {
    const fileId = this.generateRandomString(6);
    let url: string = `${this.siaUrl}/api/worker/objects/${
      file.mimetype.split("/")[0]
    }/${fileId}?bucket=${this.siaBucket}`;

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url,
      headers: {
        Authorization: `Basic ${Buffer.from(`:${this.siaPassword}`).toString(
          "base64"
        )}`,
        "Content-Type": file.mimetype, // Set the correct MIME type for the file
      },
      data: file.data, // Pass the stream as the data
    };

    try {
      const result = await axios.request(config);
      return { ...result.data, msg: "File successfully uploaded!" };
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error uploading file");
    }
  }

  public async downloadFile(
    fileType: string,
    fileId: string
  ): Promise<ReadableStream | Error> {
    let url: string = `${this.siaUrl}/api/worker/objects/${fileType}/${fileId}?bucket=${this.siaBucket}`;

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url,
      headers: {
        Authorization: `Basic ${Buffer.from(`:${this.siaPassword}`).toString(
          "base64"
        )}`,
        responseType: "stream",
      },
    };

    try {
      return await axios
        .request(config)
        .then((response) => response.data)
        .catch((error) => error);
    } catch (e: any) {
      log.error(e.message);
      throw new Error(e.message || "Error uploading file");
    }
  }

  private generateRandomString(length: number): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
}

export default SiaService;
