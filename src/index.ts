import Fastify from "fastify"
import fastifyPostgres from "@fastify/postgres"
import { AuthRequest } from "./AuthRequest"
import { auth } from "./auth"
import { game } from "./game"

const fastify = Fastify({
  logger: true,
})

// PostgreSQL connection setup
fastify.register(fastifyPostgres, {
  connectionString: "postgres://root:password@postgres:5432/postgres",
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

  const client = await fastify.pg.connect()

  const result = await client.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ])

  let user: any
  if (result.rows.length === 0) {
    // User not found
    user = null
  } else {
    user = result.rows[0]
  }

  if (!user || user.password !== password) {
    // set auth to false if user not found or password is wrong
    request.auth = false
    return // continue
  }

  // set auth to true and set username
  request.auth = true
  request.username = username
})

fastify.register(game, { prefix: "/game" })

fastify.register(auth, { prefix: "/auth" })

// Route to retrieve users from the database
fastify.get("/", async (request, reply) => {
  return { status: 200, message: "Hello world!" }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" })

    console.log("Server running on http://localhost:3000")
  } catch (error) {
    console.error("Error starting server:", error)
    process.exit(1)
  }
}

start()
