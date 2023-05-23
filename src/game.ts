import { AuthRequest } from "./AuthRequest"
import { questions } from "./questions"
import { DailyChallenge, User } from "./types"
import { FastifyPluginAsync } from "fastify"

export const game: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/leaderboard", async (request: AuthRequest, reply) => {
    //get users from postgres db
    const client = await fastify.pg.connect()

    const result = await client.query(`SELECT * FROM users`)

    const users = result.rows as User[]

    users
      .map(u => ({
        username: u.username,
        score: u.score,
        isYou: u.username === request.username,
      }))
      .sort((a, b) => b.score - a.score)

    return users
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

    //get user from postgres db of username
    const client = await fastify.pg.connect()

    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [request.username]
    )

    let user: User | undefined

    if (result.rows.length != 0) {
      user = result.rows[0] as User
    }

    if (!user) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username does not exist",
      })
    }

    // check user timestamp
    const now = Date.now()
    const timestamp = Math.floor(now / 1000)
    const diff = now - (user.last_carbon_footprint ?? 0)
    if (diff < 1000 * 60 * 60 * 24) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "You can get point for your Carbon Footprint once per day",
      })
    }

    user.score += newscore
    user.last_carbon_footprint = now

    //update user score in postgres db
    await client.query(
      "UPDATE users SET score = $1, last_carbon_footprint = to_timestamp($3) WHERE username = $2",
      [user.score, request.username, timestamp]
    )

    return user
  })

  fastify.get("/list_challenges", async (request: AuthRequest, reply) => {
    //get list of daily challenges from postgres db
    const client = await fastify.pg.connect()

    const result = await client.query(`SELECT * FROM dailyChallenges`)

    const dailyChallenges = result.rows as DailyChallenge[]

    return dailyChallenges.map(c => ({
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

    //get user from postgres db of username
    const client = await fastify.pg.connect()

    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [request.username]
    )

    let user: User | undefined

    if (result.rows.length != 0) {
      user = result.rows[0] as User
    }

    if (!user) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username does not exist",
      })
    }

    //get challenge from postgres db of challengeId
    const challengeQuery = await client.query(
      "SELECT * FROM dailyChallenges WHERE id = $1",
      [challengeId]
    )

    let challenge: DailyChallenge | undefined
    if (challengeQuery.rows.length !== 0) {
      challenge = challengeQuery.rows[0] as DailyChallenge
    }

    if (!challenge) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Challenge does not exist",
      })
    }

    // check if user already completed challenge
    if (challenge.user_completed.includes(user.id)) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "You already completed this challenge",
      })
    }

    user.score += challenge.points

    challenge.user_completed.push(user.id)

    //update challenge user_completed in postgres db
    await client.query(
      "UPDATE dailyChallenges SET user_completed = $1 WHERE id = $2",
      [challenge.user_completed, challengeId]
    )

    //update user score in postgres db
    await client.query("UPDATE users SET score = $1 WHERE username = $2", [
      user.score,
      request.username,
    ])

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

    //get user from postgres db of username
    const client = await fastify.pg.connect()

    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [request.username]
    )

    let user: User | undefined

    if (result.rows.length != 0) {
      user = result.rows[0] as User
    }

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

    //update user score in postgres db
    await client.query("UPDATE users SET score = $1 WHERE username = $2", [
      user.score,
      request.username,
    ])

    return user
  })
}
