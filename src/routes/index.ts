import { CreateElysia } from "../utils/elysia";
import AuthRoute from "./api/auth/route";

const route = CreateElysia({ prefix: '/api' }).use(AuthRoute)


export { route as APIRoute };
