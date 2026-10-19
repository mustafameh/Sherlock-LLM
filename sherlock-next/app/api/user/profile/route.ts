import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import User from '@/lib/models/User';
import { encryptApiKey, decryptApiKey } from '@/lib/server/crypto';
import { getUserFromSession, setSessionCookie } from '@/lib/server/auth';

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

    const hydrate = request.nextUrl.searchParams.get('hydrate') === '1';

    let apiKeyField: string | null = null;
    if (user.apiKey && hydrate) {
        try {
            apiKeyField = decryptApiKey(user.apiKey);
        } catch {
            apiKeyField = null;
        }
    }

    return NextResponse.json({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        avatar: user.avatar || 'detective',
        hasServerApiKey: !!user.apiKey,
        ...(hydrate && apiKeyField ? { apiKey: apiKeyField } : {}),
        selectedModel: user.selectedModel || null,
    });
}

export async function PUT(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await request.json();
        const { displayName, avatar, apiKey, selectedModel } = body;

        if (displayName && (typeof displayName !== 'string' || displayName.length > 30)) {
            return NextResponse.json({ error: 'Display name must be a string, max 30 chars' }, { status: 400 });
        }

        const validAvatars = ['detective', 'man1', 'woman1', 'man2', 'woman2', 'kid1', 'scientist', 'ninja', 'elder', 'athlete'];
        if (avatar && !validAvatars.includes(avatar)) {
            return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
        }

        const updateFields: Record<string, unknown> = {};
        if (displayName) updateFields.displayName = displayName.trim();
        if (avatar) updateFields.avatar = avatar;
        if (selectedModel !== undefined && typeof selectedModel === 'string') {
            updateFields.selectedModel = selectedModel;
        }

        const clearApiKey = apiKey !== undefined && (apiKey === null || apiKey === '');
        if (apiKey !== undefined && !clearApiKey) {
            if (typeof apiKey !== 'string' || apiKey.length > 500) {
                return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
            }
            updateFields.apiKey = encryptApiKey(apiKey);
        }

        const updateOp: Record<string, unknown> = { $set: updateFields };
        if (clearApiKey) {
            updateOp.$unset = { apiKey: 1 };
        }

        const user = await User.findByIdAndUpdate(
            sessionUser.id,
            updateOp,
            { new: true },
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const response = NextResponse.json({
            success: true,
            displayName: user.displayName || user.username,
            avatar: user.avatar || 'detective',
            hasServerApiKey: !!user.apiKey,
            selectedModel: user.selectedModel || null,
        });

        setSessionCookie(response, user);
        return response;
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
