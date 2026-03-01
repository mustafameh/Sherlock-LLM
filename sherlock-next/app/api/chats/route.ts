import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';

function getUserFromSession(request: NextRequest): { id: string } | null {
    const session = request.cookies.get('session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const sessionUser = getUserFromSession(request);

        const filter = sessionUser ? { user_id: sessionUser.id } : {};
        const chats = await Chat.find(filter)
            .select('-full_content')
            .sort({ created_at: -1 })
            .lean();

        const summaries = chats.map((chat) => ({
            id: chat._id,
            user_id: chat.user_id,
            title: chat.title,
            preview: chat.preview,
            character: chat.character,
            created_at: chat.created_at,
        }));

        return NextResponse.json(summaries);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const data = await request.json();
        const sessionUser = getUserFromSession(request);

        const newChat = await Chat.create({
            user_id: sessionUser?.id,
            title: data.title,
            preview: data.preview,
            full_content: data.full_content,
            character: data.character,
        });

        return NextResponse.json({ message: 'Chat saved successfully', id: newChat._id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
