import crypto from "crypto"
import { FastifyPluginAsync } from "fastify"
import { User, db } from "./db.js"

export const auth: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/register", async (request, reply) => {
    const body: {
      username?: string
      password?: string
    } = request.body ?? {}

    const { username, password } = body
    if (!username || !password) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username and password are required",
      })
    }

    //postgres query
    const client = await fastify.pg.connect()

    const result = await client.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    )

    if (result.rows.length > 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username already exists",
      })
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password,
      email: "prova@gmail.com",
      score: 0,
    }

    //update postgres db with new user
    await client.query(
      "INSERT INTO users (id, username, password,email, score) VALUES ($1, $2, $3, $4, $5)",
      [
        newUser.id,
        newUser.username,
        newUser.password,
        newUser.email,
        newUser.score,
      ]
    )

    return newUser
  })

  fastify.post("/login", async (request, reply) => {
    const body: {
      username?: string
      password?: string
    } = request.body ?? {}
    const { username, password } = body
    if (!username || !password) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username and password are required",
      })
    }

    const client = await fastify.pg.connect()

    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    )

    if (result.rows.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username does not exist",
      })
    }

    const user = result.rows[0]

    if (user.password !== password) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Password is incorrect",
      })
    }

    return user
  })
}
