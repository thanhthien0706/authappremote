import { db } from "../data/dbConnection";
import { comparePassword, hashPassword } from "../utils/bcrypt";

const signUp = async ({ body, set, jwt, cookie: { auth }, setCookie }: any) => {
    const { userName, email, password } = body;

    const emailExist = await db.user.findUnique({
        where: { email },
        select: {
            id: true
        }
    })

    if (emailExist) {
        set.status = 400
        return {
            success: false,
            data: null,
            message: "Email address already in use.",
        };
    }

    const { hash, salt } = await hashPassword(password);

    const newUser = await db.user.create({
        data: {
            email,
            username: userName,
            password: hash,
            refreshToken: null,
            salt: salt
        },
        select: {
            id: true,
            email: true,
            username: true
        }
    });

    const [accessToken, refreshToken] = await Promise.all([
        jwt.sign({
            email: newUser.email,
            userId: newUser.id,
            exp: 900
        }),
        jwt.sign({
            email: newUser.email,
            userId: newUser.id,
            exp: 302400
        })
    ])

    setCookie("access_token", accessToken, {
        maxAge: 15 * 60, // 15 minutes
        path: "/",
    });

    const hashRereshToken = await hashPassword(refreshToken)

    const inforUser = await db.user.update(
        {
            data: {
                refreshToken: hashRereshToken.hash,
                saltToken: hashRereshToken.salt
            },
            where: {
                id: newUser.id
            },
            select: {
                email: true,
                username: true,
            }
        }
    )

    return {
        accessToken,
        refreshToken,
        user: { ...inforUser }
    }
}

const signIn = async ({ body, set, jwt, cookie: { auth }, setCookie }: any) => {
    const { email, password } = body
    const userInfor = await db.user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            email: true,
            password: true,
            salt: true,
            username: true
        }
    })

    if (!userInfor) {
        set.status = 400
        return {
            success: false,
            data: null,
            message: "User not found",
        };
    }

    const comparePass = await comparePassword(password, userInfor.salt, userInfor.password)
    if (!comparePass) {
        set.status = 400
        return {
            success: false,
            data: null,
            message: "Invalid password",
        };
    }

    const [accessToken, refreshToken] = await Promise.all([
        jwt.sign({
            email: userInfor.email,
            userId: userInfor.id,
            exp: 15 * 60
        }),
        jwt.sign({
            email: userInfor.email,
            userId: userInfor.id,
            exp: 60 * 60 * 12 * 7
        })
    ])

    setCookie("access_token", accessToken, {
        maxAge: 15 * 60, // 15 minutes
        path: "/",
    });

    const hashRereshToken = await hashPassword(refreshToken)

    const inforUser = await db.user.update(
        {
            data: {
                refreshToken: hashRereshToken.hash,
                saltToken: hashRereshToken.salt
            },
            where: {
                id: userInfor.id
            },
            select: {
                email: true,
                username: true
            }
        }
    )

    return {
        accessToken,
        refreshToken,
        user: { ...inforUser }
    }

}

const refreshToken = async ({ body, set, jwt, cookie: { auth }, setCookie }: any) => {
    const { userId, refreshToken } = body;

    const inforUser = await db.user.findUnique({
        where: {
            id: userId,
        }
        ,
        select: {
            refreshToken: true,
            saltToken: true,
            email: true,
            id: true,
        }
    });

    if (!inforUser || !inforUser.refreshToken || !inforUser.saltToken) {
        set.status = 400
        return {
            success: false,
            data: null,
            message: "User not found",
        };
    };

    const compareToken = comparePassword(refreshToken, inforUser.saltToken, inforUser.refreshToken)

    if (!compareToken) {
        set.status = 401
        return {
            success: false,
            data: null,
            message: "Unauthorized",
        };
    }

    const [accessToken, refreshTokenD] = await Promise.all([
        jwt.sign({
            email: inforUser.email,
            userId: inforUser.id,
            exp: 15 * 60
        }),
        jwt.sign({
            email: inforUser.email,
            userId: inforUser.id,
            exp: 60 * 60 * 12 * 7
        })
    ])

    setCookie("access_token", accessToken, {
        maxAge: 15 * 60, // 15 minutes
        path: "/",
    });

    const hashRereshToken = await hashPassword(refreshTokenD)

    const userUpdate = await db.user.update(
        {
            data: {
                refreshToken: hashRereshToken.hash,
                saltToken: hashRereshToken.salt
            },
            where: {
                id: userId
            },
            select: {
                email: true,
                username: true
            }
        }
    )

    return {
        accessToken,
        refreshTokenD,
        user: { ...userUpdate }
    }
}

const logOut = async ({ body, set, jwt, cookie: { access_token }, setCookie, }: any) => {
    const profile = await jwt.verify(access_token)

    if (!profile) {
        set.status = 401
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }

    await db.user.update({
        data: {
            refreshToken: null
        },
        where: {
            id: +profile.userId,
        },
    })

    setCookie("access_token", "", {
        path: "/",
    });

    set.status = 200

    return {
        success: true,
        message: "Logout successfully",
        data: null,
    };
}

const getMe = async ({ body, set, jwt, cookie: { access_token }, setCookie, }: any) => {
    const profile = await jwt.verify(access_token)

    if (!profile) {
        set.status = 401
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }

    const user = await db.user.findUnique({
        where: {
            id: +profile.userId,
        },
        select: {
            id: true,
            email: true,
            username: true,
        }
    })

    return {
        success: true,
        message: "Information User",
        data: user,
    };
}

export { signUp, signIn, logOut, getMe, refreshToken }