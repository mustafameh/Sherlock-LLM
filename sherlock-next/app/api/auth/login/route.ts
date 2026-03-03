import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';

function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

const isProduction = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ username });

        if (!user || user.password_hash !== hashPassword(password)) {
            return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
        }

        const response = NextResponse.json({ success: true, message: 'Login successful' });
        response.cookies.set('session', JSON.stringify({
            id: user._id,
            username: user.username,
            email: user.email,
        }), {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
}
