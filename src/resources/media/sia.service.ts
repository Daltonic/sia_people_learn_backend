require('dotenv').config()
import log from '@/utils/logger'
import axios from 'axios'
import { FileUpload } from './media.interface'

class SiaService {
  private siaBucket: string
  private siaUrl: string
  private siaPassword: string
  private baseUrl: string

  constructor() {
    this.siaBucket = String(process.env.SIA_BUCKET)
    this.siaUrl = String(process.env.SIA_BASE_URL)
    this.siaPassword = String(process.env.SIA_API_PASSWORD)
    this.baseUrl = String(process.env.ORIGIN)
  }

  public async uploadFile(file: FileUpload): Promise<object | Error> {
    const fileId = this.generateRandomString(6)
    const folder = file.mimetype.split('/')[0]
    const url: string = `${this.siaUrl}/api/worker/objects/${folder}/${fileId}?bucket=${this.siaBucket}`

    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url,
      headers: {
        Authorization: `Basic ${Buffer.from(`:${this.siaPassword}`).toString(
          'base64'
        )}`,
        'Content-Type': file.mimetype, // Set the correct MIME type for the file
      },
      data: file.data, // Pass the stream as the data
    }

    try {
      const result = await axios.request(config)
      return {
        ...result.data,
        url: `${this.baseUrl}/api/v1/media/sia/download/${folder}/${fileId}`,
        message: 'File successfully uploaded!',
      }
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error uploading file')
    }
  }

  public async downloadFile(
    folder: string,
    fileId: string
  ): Promise<NodeJS.ReadableStream> {
    let url: string = `${this.siaUrl}/api/worker/objects/${folder}/${fileId}?bucket=${this.siaBucket}`

    let config = {
      method: 'GET',
      maxBodyLength: Infinity,
      url,
      headers: {
        Authorization: `Basic ${Buffer.from(`:${this.siaPassword}`).toString(
          'base64'
        )}`,
      },
      responseType: 'stream' as const,
    }

    try {
      const response = await axios.request(config)
      return response.data
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message || 'Error uploading file')
    }
  }

  private generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }
}

export default SiaService
