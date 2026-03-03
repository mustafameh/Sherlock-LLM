import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import Character from '@/lib/models/Character';

export async function GET() {
    try {
        await dbConnect();
        const characters = await Character.find().lean();
        return NextResponse.json(characters);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const newCharacter = await request.json();

        const updated = await Character.findOneAndUpdate(
            { name: newCharacter.name },
            newCharacter,
            { upsert: true, new: true }
        );

        return NextResponse.json(updated, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
