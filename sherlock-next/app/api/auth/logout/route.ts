import { NextResponse } from 'next/server';

export async function GET() {
    const response = NextResponse.redirect(new URL('/', 'http://localhost:3000'));
    response.cookies.delete('session');
    return response;
}
