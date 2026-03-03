import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
    const session = request.cookies.get('session');
    if (session) {
        try {
            await dbConnect();
            const sessionData = JSON.parse(session.value);
            const user = await User.findById(sessionData.id);

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
    return NextResponse.json({ logged_in: false });
}
