import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { setSessionCookie } from '@/lib/server/auth';
import { hashPassword } from '@/lib/server/password';

function validate(username: unknown, email: unknown, password: unknown): string | null {
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string'
        || !username || !email || !password) {
        return 'All fields are required';
    }
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
        return 'Username must be 3-30 characters: letters, numbers, dots, dashes or underscores';
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address';
    }
    if (password.length < 8 || password.length > 200) {
        return 'Password must be at least 8 characters';
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password } = await request.json();

        const invalid = validate(username, email, password);
        if (invalid) {
            return NextResponse.json({ success: false, message: invalid }, { status: 400 });
        }

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Username or email already exists' }, { status: 400 });
        }

        const newUser = await User.create({
            username,
            email,
            password_hash: await hashPassword(password),
        });

        const response = NextResponse.json({ success: true, message: 'Registration successful' });
        setSessionCookie(response, newUser);
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
