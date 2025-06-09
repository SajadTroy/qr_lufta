import { cookies } from 'next/headers';
import { getIronSession } from "iron-session";

export const sessionOptions = {
    password: process.env.SESSION_SECRET,
    cookieName: "admin_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

export const getSession = async () => {
    const session = await getIronSession((await cookies()), sessionOptions);
    return session;
};
