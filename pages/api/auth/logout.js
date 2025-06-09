import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getIronSession(req, res, sessionOptions);
        session.destroy();
        return res.status(200).json({ logout: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to log out' });
    }
}