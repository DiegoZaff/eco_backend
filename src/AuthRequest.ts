import { FastifyRequest } from "fastify"

type AuthParam =
  | {
      auth: true
      username: string
    }
  | {
      auth?: false
      username?: undefined
    }

export type AuthRequest = FastifyRequest & AuthParam
