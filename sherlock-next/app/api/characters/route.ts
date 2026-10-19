import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongodb';
import Character from '@/lib/models/Character';
import { getUserFromSession } from '@/lib/server/auth';

const TEXT_FIELDS = ['name', 'description', 'relationship', 'speakingStyle', 'sherlockApproach'] as const;
const MAX_TEXT = 2000;
const MAX_TRAITS = 20;

type CharacterFields = Record<(typeof TEXT_FIELDS)[number], string> & { traits: string[] };

/** Picks the character fields from a request body, or returns why it's invalid. */
function parseCharacter(body: Record<string, unknown>): { data: CharacterFields } | { error: string } {
    const text: Partial<Record<(typeof TEXT_FIELDS)[number], string>> = {};
    for (const field of TEXT_FIELDS) {
        const value = body[field] ?? '';
        if (typeof value !== 'string' || value.length > MAX_TEXT) return { error: `Invalid ${field}` };
        text[field] = value.trim();
    }
    if (!text.name || !text.description) return { error: 'Name and description are required' };

    const traits = body.traits ?? [];
    if (!Array.isArray(traits) || traits.length > MAX_TRAITS
        || traits.some(t => typeof t !== 'string' || t.length > 100)) {
        return { error: 'Invalid traits' };
    }
    return { data: { ...(text as Record<(typeof TEXT_FIELDS)[number], string>), traits } };
}

/** The signed-in user's custom characters. */
export async function GET(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const characters = await Character.find({ user_id: sessionUser.id }).lean();
        return NextResponse.json(characters);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

/** Saves (or updates, by name) one of the signed-in user's custom characters. */
export async function POST(request: NextRequest) {
    const sessionUser = getUserFromSession(request);
    if (!sessionUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const parsed = parseCharacter(await request.json());
        if ('error' in parsed) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const updated = await Character.findOneAndUpdate(
            { user_id: sessionUser.id, name: parsed.data.name },
            { $set: { ...parsed.data, user_id: sessionUser.id } },
            { upsert: true, new: true }
        );

        return NextResponse.json(updated, { status: 201 });
    } catch (error) {
        if ((error as { code?: number })?.code === 11000) {
            return NextResponse.json({ error: 'A character with that name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
