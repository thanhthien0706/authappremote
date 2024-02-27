import { Elysia } from "elysia";

export const isAuthenticated = async ({ cookie: { access_token }, set, jwt }: any) => {
    if (!access_token) {
        set.status = 401
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }

    const profile = await jwt.verify(access_token)
    if (!profile) {
        set.status = 401
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }
}


