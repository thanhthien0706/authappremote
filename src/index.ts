import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { APIRoute } from "./routes";

class Unauthorized extends Error {
  constructor() {
    super("Unauthorized");
  }
}

const app = new Elysia()
  .use(cors())
  .use(cookie())
  .use(jwt({
    name: "jwt",
    secret: process.env.JWT_SECERTS!,

  }))
  .use(swagger())
  .onError(({ code, error }) => {
    let status = {
      "VALIDATION": 400,
      "NOT_FOUND": 404,
      "INTERNAL_SERVER_ERROR": 111,
      "INVALID_COOKIE_SIGNATURE": 222,
      "PARSE": 333,
      "UNKNOWN": 444,
    }[code];

    return new Response(error.toString(), { status })
  })
  .use(APIRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
