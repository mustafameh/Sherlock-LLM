import 'server-only';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionUser {
    id: string;
    username: string;
    email: string;
}

const COOKIE_NAME = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === 'production';

function getSecret(): Buffer {
    const explicit = process.env.SESSION_SECRET;
    if (explicit) return Buffer.from(explicit);
    const base = process.env.API_KEY_SECRET;
    if (!base) throw new Error('SESSION_SECRET or API_KEY_SECRET must be set');
    return crypto.createHmac('sha256', base).update('sherlock-session-v1').digest();
}

function sign(payload: string): string {
    return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

/**
 * Reads the signed session cookie. Returns null when it is missing, expired, or not signed by
 * this server (including the unsigned cookies older versions of the app issued).
 */
export function getUserFromSession(request: NextRequest): SessionUser | null {
    const raw = request.cookies.get(COOKIE_NAME)?.value;
    if (!raw) return null;

    const [payload, signature] = raw.split('.');
    if (!payload || !signature) return null;

    try {
        const expected = Buffer.from(sign(payload));
        const actual = Buffer.from(signature);
        if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (typeof data.id !== 'string' || typeof data.exp !== 'number' || data.exp * 1000 < Date.now()) return null;
        return { id: data.id, username: data.username, email: data.email };
    } catch {
        return null;
    }
}

/** Logs the user in on this response with a signed, httpOnly session cookie valid for 7 days. */
export function setSessionCookie(
    response: NextResponse,
    user: { _id: unknown; username: string; email: string },
): void {
    const payload = Buffer.from(JSON.stringify({
        id: String(user._id),
        username: user.username,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    })).toString('base64url');

    response.cookies.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: MAX_AGE_SECONDS,
        path: '/',
    });
}

export function clearSessionCookie(response: NextResponse): void {
    response.cookies.delete(COOKIE_NAME);
}
