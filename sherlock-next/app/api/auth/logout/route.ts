import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
    const url = new URL('/', request.url);
    const response = NextResponse.redirect(url);
    clearSessionCookie(response);
    return response;
}
