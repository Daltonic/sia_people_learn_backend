require('dotenv').config()
import fs from 'fs'
import log from '@/utils/logger'
import axios from 'axios'

class SiaService {
  private siaRootDir: string
  private siaBucket: string
  private siaUrl: string
  private siaPassword: string

  constructor() {
    this.siaRootDir = String(process.env.SIAROOTDIR)
    this.siaBucket = String(process.env.SIABUCKET)
    this.siaUrl = String(process.env.SIAURL)
    const apiPassword: string = String(process.env.SIAAPIPASSWORD)
    this.siaPassword = Buffer.from(`:${apiPassword}`).toString('base64')

    if (this.siaBucket?.length) {
      this.verifyOrCreateBucket(this.siaBucket)
    }
  }

  private async uploadFile(
    fileStream: fs.ReadStream,
    roomId: string,
    fileId: string
  ): Promise<object | Error> {
    let url: string = `${this.siaUrl}/api/worker/objects/${this.siaRootDir}//`
    if (this.siaBucket?.length) {
      url += `?bucket=${this.siaBucket}`
    }

    try {
      const result = await axios
        .put(url, fileStream, {
          headers: {
            Authorization: `Basic ${this.siaPassword}`,
          },
          maxRedirects: 0,
          validateStatus: () => true,
        })
        .then((response) => {
          console.log(response.data)
          return response.data
        })
        .catch((error) => {
          console.log('error', error)
          return error
        })

      return result
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error checking out with stripe')
    }
  }

  private async fetchFile(
    roomId: string,
    fileId: string,
    rangeHeader: string
  ): Promise<NodeJS.ReadableStream | any | Error> {
    const requestOptions = {
      method: 'get',
      headers: {
        Authorization: `Basic ${this.siaPassword}`,
        Range: rangeHeader,
      },
    }
    let url: string = `${this.siaUrl}/api/worker/objects/${this.siaRootDir}/${roomId}/${fileId}`
    if (this.siaBucket?.length) {
      url += `?bucket=${this.siaBucket}`
    }

    try {
      const response = await axios.request({
        url: url,
        method: 'GET',
        headers: requestOptions.headers,
        responseType: 'stream',
      })

      if (!response) {
        throw new Error('Fetch returned null')
      }
      if (response.status === 404) {
        console.log('File not found on sia network')
        return Promise.reject()
      }

      return response.data
    } catch (error) {
      console.error(error)
      return error
    }
  }

  private async deleteRoom(roomId: string): Promise<boolean> {
    const requestOptions = {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${this.siaPassword}`,
      },
    }
    let url: string = `${this.siaUrl}/api/worker/objects/${this.siaRootDir}/?batch=true`
    if (this.siaBucket?.length) {
      url += `&bucket=${this.siaBucket}`
    }

    try {
      const response = await axios.request({
        url: url,
        method: 'DELETE',
        headers: requestOptions.headers,
      })

      if (response.status === 404) {
        console.log(`deleteRoom (): room not found on sia network`)
      } else {
        console.log(`deleteRoom () status: ${response.status}`)
      }
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  private verifyOrCreateBucket(bucketName: string): void {
    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.siaPassword}`,
      },
    }

    try {
      axios
        .get(`${this.siaUrl}/api/bus/buckets/`, requestOptions)
        .then((res) => {
          if (res.status === 404) {
            // Bucket doesn't exist, create it
            console.log(`Bucket  not found, creating...`)

            const createRequestOptions = {
              method: 'POST',
              headers: {
                Authorization: `Basic ${this.siaPassword}`,
              },
              data: {
                name: bucketName,
              },
            }

            axios
              .post(`${this.siaUrl}/api/bus/buckets`, createRequestOptions)
              .then((response) => {
                if (response.status !== 200) {
                  console.error('Failed to create bucket')
                  throw Error('Failed to create bucket')
                }
              })
          }
        })
        .catch((e: any) => {
          log.error(e.message)
          throw new Error(e.message || 'Error checking out with stripe')
        })
    } catch (e: any) {
      log.error(e.message)
      throw new Error(e.message || 'Error checking out with stripe')
    }
  }
}

export default SiaService
