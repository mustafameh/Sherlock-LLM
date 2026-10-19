import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { setSessionCookie } from '@/lib/server/auth';
import { hashPassword, verifyPassword } from '@/lib/server/password';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { username, password } = await request.json();

        if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ username });
        const check = user ? await verifyPassword(password, user.password_hash) : null;

        if (!user || !check?.valid) {
            return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
        }

        // Upgrade accounts still on the old unsalted hash now that we have the plain password.
        if (check.needsRehash) {
            await User.updateOne({ _id: user._id }, { $set: { password_hash: await hashPassword(password) } });
        }

        const response = NextResponse.json({ success: true, message: 'Login successful' });
        setSessionCookie(response, user);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Login failed. Please try again.' }, { status: 500 });
    }
}
