import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Username or email already exists' }, { status: 400 });
        }

        const newUser = await User.create({
            username,
            email,
            password_hash: hashPassword(password),
        });

        const response = NextResponse.json({ success: true, message: 'Registration successful' });
        response.cookies.set('session', JSON.stringify({
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        }), {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
}
