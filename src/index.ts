import Fastify from "fastify"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

interface DBSchema {
  users: {
    username: string
    password: string
  }[]
}

const adapter = new JSONFile<DBSchema>("./db/db.json")
const db = new Low(adapter, {
  users: [],
})

const fastify = Fastify({
  logger: true,
})

fastify.get("/", async (request, reply) => {
  return { hello: "world" }
})

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

  const newUser = { username, password }
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

fastify.get("/dumpdb", async (request, reply) => {
  return db.data
})

// write database at the end of every request
fastify.addHook("onResponse", async (request, reply) => {
  await db.write()
})

const start = async () => {
  try {
    await db.write()
    await fastify.listen({ port: 3000, host: "0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
