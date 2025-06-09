import { ironSession } from "iron-session/edge";

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const getSession = async (req) => {
  const session = await ironSession(req, sessionOptions);
  return session;
};
