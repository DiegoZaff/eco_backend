import Fastify from "fastify"
import { db } from "./db.js"
import { auth } from "./auth.js"
import { game } from "./game.js"
import { AuthRequest } from "./AuthRequest.js"

const fastify = Fastify({
  logger: true,
})

// Register Hooks
// check authentication for every request
fastify.addHook("preHandler", async (request: AuthRequest, reply) => {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    // set auth to false if no auth header
    request.auth = false
    return // continue
  }

  const [type, token] = authHeader.split(" ")
  if (type !== "Basic") {
    // set auth to false if not basic auth
    request.auth = false
    return // continue
  }

  const [username, password] = token.split(":")
  const user = db.data.users.find(user => user.username === username)
  if (!user || user.password !== password) {
    // set auth to false if user not found or password is wrong
    request.auth = false
    return // continue
  }

  // set auth to true and set username
  request.auth = true
  request.username = username
})

// write database at the end of every request
fastify.addHook("onResponse", async (request, reply) => {
  await db.write()
})

// Register Plugins
fastify.register(auth, { prefix: "/auth" })
fastify.register(game, { prefix: "/game" })

// Register basic routes
fastify.get("/", async (request, reply) => {
  return { status: 200, message: "Hello world!" }
})

fastify.get("/dumpdb", async (request, reply) => {
  return db.data
})

// Start server
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
