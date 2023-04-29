import { AuthRequest } from "./AuthRequest.js"
import { db } from "./db.js"
import { FastifyPluginAsync } from "fastify"
import { questions } from "./questions.js"

export const game: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/leaderboard", async (request: AuthRequest, reply) => {
    const ldb = db.data.users
      .map(u => ({
        username: u.username,
        score: u.score,
        isYou: u.username === request.username,
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

  fastify.get("/random_quiz", async (request: AuthRequest, reply) => {
    // get 4 random challenges
    const challenges = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(c => ({
        id: c.id,
        title: c.domanda,
        options: c.risposte.sort(() => Math.random() - 0.5),
      }))
    return challenges
  })

  fastify.post("/complete_quiz", async (request: AuthRequest, reply) => {
    // check if user is authenticated
    if (!request.auth) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "User is not authenticated",
      })
    }

    type QuizAnswer = { id: string; answer: string }
    type Quiz = QuizAnswer[]
    const body: {
      quiz?: Quiz
    } = request.body ?? {}
    const { quiz } = body

    if (!quiz) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "quizId is required",
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

    // check for each answer if it's correct
    const newScore = quiz.reduce(
      (score, answer) =>
        questions.find(q => q.id === answer.id)?.risposte[0] === answer.answer
          ? score + 1
          : score,
      0
    )

    user.score += newScore
    return user
  })
}
