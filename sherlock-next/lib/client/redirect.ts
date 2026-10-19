'use client';

/** Where to go after logging in or signing up: the `next` query param if it's a path on this site, else home. */
export function postAuthRedirect(): string {
    const next = new URLSearchParams(window.location.search).get('next');
    const isLocalPath = !!next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
    return isLocalPath ? next : '/';
}
