import express, { Application, Request } from 'express'
import fileupload from 'express-fileupload'
import mongoose from 'mongoose'
import Controller from '@/utils/interfaces/controller.interface'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import passport from 'passport'
import { deserialiseUser, errorMiddleware } from './middlewares'
import '@/middlewares/passportStrategies'
import { log } from './utils'

interface RawBodyRequest extends Request {
  rawBody?: string;
}

class App {
  private express: Application
  private port: number

  constructor(controllers: Controller[], port: number) {
    this.express = express()
    this.port = port

    this.initialiseDatabaseConnection()
    this.initialiseMiddlewares()
    this.initialiseControllers(controllers)
    this.initialiseErrorHandler()
  }

  private initialiseDatabaseConnection() {
    const { MONGO_URI } = process.env

    if (MONGO_URI) {
      mongoose.set('strictQuery', false)
      mongoose.connect(MONGO_URI, { autoIndex: true })
    }
    log.info('Database connected')
  }

  private initialiseMiddlewares() {
    this.express.use(helmet())
    this.express.use(fileupload())
    this.express.use(
      cors({
        origin: '*',
      })
    )
    this.express.set('trust proxy', 1)

    this.express.use(
      express.json({
        type: 'application/json',
        limit: '5mb',
        verify: (req: RawBodyRequest, res, buf) => {
          req.rawBody = buf.toString()
        },
      })
    )
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(compression())
    this.express.use(passport.initialize())
    this.express.use(deserialiseUser)
  }

  

  private initialiseControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.express.use('/api/v1', controller.router)
    })
  }

  private initialiseErrorHandler() {
    this.express.use(errorMiddleware)
  }

  public listen() {
    this.express.listen(this.port, () => {
      console.log(`App is listening on PORT:${this.port}`)
    })
  }
}

export default App
