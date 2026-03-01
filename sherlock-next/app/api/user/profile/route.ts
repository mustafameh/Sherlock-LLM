import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

function getUserFromSession(request: NextRequest): { id: string; username: string; email: string } | null {
    const session = request.cookies.get('session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(sessionUser.id);

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        avatar: user.avatar || 'detective',
    });
}

export async function PUT(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { displayName, avatar } = await request.json();

        if (displayName && (typeof displayName !== 'string' || displayName.length > 30)) {
            return NextResponse.json({ error: 'Display name must be a string, max 30 chars' }, { status: 400 });
        }

        const validAvatars = ['detective', 'man1', 'woman1', 'man2', 'woman2', 'kid1', 'scientist', 'ninja', 'elder', 'athlete'];
        if (avatar && !validAvatars.includes(avatar)) {
            return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
        }

        const updateFields: Record<string, string> = {};
        if (displayName) updateFields.displayName = displayName.trim();
        if (avatar) updateFields.avatar = avatar;

        const user = await User.findByIdAndUpdate(sessionUser.id, updateFields, { new: true });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const response = NextResponse.json({
            success: true,
            displayName: user.displayName || user.username,
            avatar: user.avatar || 'detective',
        });

        response.cookies.set('session', JSON.stringify({
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar,
        }), {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
