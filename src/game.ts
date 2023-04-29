import { AuthRequest } from "./AuthRequest.js"
import { db } from "./db.js"
import { FastifyPluginAsync } from "fastify"

export const game: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/leaderboard", async (request, reply) => {
    const ldb = db.data.users
      .map(u => ({
        username: u.username,
        score: u.score,
      }))
      .sort((a, b) => b.score - a.score)

    return ldb
  })

  fastify.post("/carbon_footprint", async (request: AuthRequest, reply) => {
    // check if user is authenticated
    if (!request.auth) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "User is not authenticated",
      })
    }

    const body: {
      newscore?: number
    } = request.body ?? {}
    const { newscore } = body

    if (!newscore) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "new score is required",
      })
    }

    const user = db.data.users.find(user => user.username === request.username)
    if (!user) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username does not exist",
      })
    }

    // check user timestamp
    const now = Date.now()
    const diff = now - (user.lastCarbonFootprint ?? 0)
    if (diff < 1000 * 60 * 60 * 24) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "You can get point for your Carbon Footprint once per day",
      })
    }

    user.score += newscore
    user.lastCarbonFootprint = now
    return user
  })
}
