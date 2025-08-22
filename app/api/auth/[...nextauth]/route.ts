import bcrypt from 'bcryptjs';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '../../../../lib/prisma';

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Credentials({
            name: 'Email e senha',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user?.password) return null;

                const ok = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!ok) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name ?? undefined,
                    //lastName: user.lastName ?? undefined,
                    role: user.role,
                } as unknown as NextAuthUser;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as unknown as { id?: string | number; role?: unknown };
                const t = token as unknown as Record<string, unknown>;
                if (u.id !== undefined) t.id = u.id;
                if (u.role !== undefined) t.role = u.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const su = session.user as unknown as Record<string, unknown>;
                const t = token as unknown as Record<string, unknown>;
                su.id = t.id;
                su.role = t.role;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
