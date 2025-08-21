import { NextResponse } from 'next/server';

// Stub temporário para o NextAuth client
export async function GET() {
    return NextResponse.json({
        credentials: {
            id: 'credentials',
            name: 'Email e senha',
            type: 'credentials',
            signinUrl: '/api/auth/signin/credentials',
            callbackUrl: '/api/auth/callback/credentials',
        },
    });
}
