import Fastify from "fastify"
import fastifyPostgres from "@fastify/postgres"

const fastify = Fastify({
  logger: true,
})

// PostgreSQL connection setup
fastify.register(fastifyPostgres, {
  connectionString: "postgres://root:root@localhost:5432/root",
})

// Register Hooks
// check authentication for every request
/* fastify.addHook("preHandler", async (request: AuthRequest, reply) => {
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
}) */

// Route to retrieve users from the database

fastify.get("/users", async (request, reply) => {
  try {
    const { rows } = await fastify.pg.query("SELECT * FROM users")
    reply.send(rows)
  } catch (error) {
    console.error("Error retrieving users:", error)
    reply.code(500).send({ error: "Internal server error" })
  }
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
