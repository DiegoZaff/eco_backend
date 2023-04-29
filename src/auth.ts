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

    const user = db.data.users.find(user => user.username === username)
    if (user) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username already exists",
      })
    }

    const newUser: User = {
      username,
      password,
      score: 0,
    }
    db.data.users.push(newUser)
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

    const user = db.data.users.find(user => user.username === username)
    if (!user) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Username does not exist",
      })
    }

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
