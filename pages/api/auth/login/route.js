// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function POST(req) {
    const body = await req.json();
    const { username, password } = body;

    // Replace with real validation
    if (username === 'admin' && password === 'yourpassword') {
        const res = NextResponse.json({ success: true });
        const session = await getIronSession(req, res, sessionOptions);

        session.isAdmin = true;
        session.username = username;
        await session.save();

        return res;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}