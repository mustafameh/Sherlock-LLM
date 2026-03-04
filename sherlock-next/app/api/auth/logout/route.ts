import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL('/', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete('session');
    return response;
}
