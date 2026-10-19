import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { getUserFromSession } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ logged_in: false });
    }

    try {
        await dbConnect();
        const user = await User.findById(sessionUser.id);

        if (user) {
            return NextResponse.json({
                logged_in: true,
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                avatar: user.avatar || 'detective',
            });
        }
        return NextResponse.json({ logged_in: false });
    } catch {
        return NextResponse.json({ logged_in: false });
    }
}
