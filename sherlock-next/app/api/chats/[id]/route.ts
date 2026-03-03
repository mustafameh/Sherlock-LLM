import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import Chat from '@/lib/models/Chat';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const chat = await Chat.findById(id).lean();

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: chat._id,
            user_id: chat.user_id,
            title: chat.title,
            preview: chat.preview,
            full_content: chat.full_content,
            character: chat.character,
            created_at: chat.created_at,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await request.json();

        const chat = await Chat.findByIdAndUpdate(id, {
            title: data.title,
            preview: data.preview,
            full_content: data.full_content,
            character: data.character,
        }, { new: true });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Chat updated successfully', id: chat._id });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const chat = await Chat.findByIdAndDelete(id);

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
