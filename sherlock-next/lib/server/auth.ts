import 'server-only';
import { NextRequest } from 'next/server';

export interface SessionUser {
    id: string;
    username: string;
    email: string;
}

export function getUserFromSession(request: NextRequest): SessionUser | null {
    const session = request.cookies.get('session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}
