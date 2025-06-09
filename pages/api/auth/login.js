// pages/api/auth/login.js
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../../lib/session";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    if (username === "admin" && password === process.env.SESSION_SECRET) {
        const session = await getIronSession(req, res, sessionOptions);
        session.isAdmin = true;
        session.username = username;
        await session.save();

        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
}
