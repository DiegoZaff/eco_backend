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

  fastify.get("/list_challenges", async (request: AuthRequest, reply) => {
    return db.data.dailyChallenges.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      points: c.points,
    }))
  })

  fastify.post("/complete_challenge", async (request: AuthRequest, reply) => {
    // check if user is authenticated
    if (!request.auth) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "User is not authenticated",
      })
    }

    const body: {
      challengeId?: string
    } = request.body ?? {}
    const { challengeId } = body

    if (!challengeId) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "challengeId is required",
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

    const challenge = db.data.dailyChallenges.find(c => c.id === challengeId)
    if (!challenge) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Challenge does not exist",
      })
    }

    // check if user already completed challenge
    if (challenge.userCompleted.includes(user.id)) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "You already completed this challenge",
      })
    }

    user.score += challenge.points
    challenge.userCompleted.push(user.id)
    return user
  })
}
