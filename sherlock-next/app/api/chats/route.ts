import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import Chat from '@/lib/models/Chat';
import { getUserFromSession } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const sessionUser = getUserFromSession(request);

        const chatType = request.nextUrl.searchParams.get('type');

        const filter: Record<string, unknown> = {};
        if (sessionUser) filter.user_id = sessionUser.id;
        if (chatType) filter.chat_type = chatType;

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
            chat_type: chat.chat_type || 'roleplay',
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
            chat_type: data.chat_type || 'roleplay',
        });

        return NextResponse.json({ message: 'Chat saved successfully', id: newChat._id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
