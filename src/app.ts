import fastifyCors from "@fastify/cors";
import fastify from "fastify";

const app = fastify()

app.register(fastifyCors)

export { app };

