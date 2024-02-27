import { t } from "elysia";
import { CreateElysia } from "../../../utils/elysia";
import { isAuthenticated } from "../../../middlewares/auth";
import { db } from "../../../data/dbConnection";
import { comparePassword, hashPassword } from "../../../utils/bcrypt";
import jwt from "@elysiajs/jwt";
import { getMe, logOut, signIn, signUp } from "../../../controller/auth";

const AuthRoute = CreateElysia({ prefix: "/v1", })
    .post("/sign-up", signUp, {
        body: t.Object({
            userName: t.String(),
            email: t.String(),
            password: t.String(),
        })
    })
    .post("/sign-in", signIn, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
        })
    })
    .post("/logout", logOut, {
        beforeHandle: isAuthenticated,
    })
    .get("/me", getMe, {
        beforeHandle: isAuthenticated,
    })


export default AuthRoute