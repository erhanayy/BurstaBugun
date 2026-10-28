import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from './lib/db';
import { users } from './lib/db/schema';
import { eq, or, and, isNull, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function getUserByIdentifier(identifier: string, tenantId?: string) {
    try {
        const trimmed = identifier.trim();
        const isEmail = trimmed.includes('@');
        const digits = trimmed.replace(/\D/g, '');
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

        let identifierFilter;
        if (isEmail) {
            identifierFilter = eq(users.email, trimmed.toLowerCase());
        } else if (digits.length >= 7) {
            identifierFilter = or(
                eq(users.phoneNumber, trimmed),
                sql`regexp_replace(${users.phoneNumber}, '[^0-9]', '', 'g') LIKE ${'%' + last10}`
            );
        } else {
            identifierFilter = eq(users.email, trimmed.toLowerCase());
        }

        const whereClause = tenantId 
            ? and(
                identifierFilter,
                or(
                    eq(users.tenantId, tenantId),
                    isNull(users.tenantId) // allow super admins
                )
            )
            : identifierFilter;

        const userResult = await db.select().from(users).where(whereClause).limit(1);
        return userResult[0];
    } catch (error) {
        console.error('Failed to fetch user by identifier:', error);
        return null;
    }
}

const nextAuthResult = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ identifier: z.string(), password: z.string().min(4), tenantId: z.string().optional() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { identifier, password, tenantId } = parsedCredentials.data;
                    const user = await getUserByIdentifier(identifier, tenantId);

                    if (!user) return null;
                    if (!user.password) return null; // No password set

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.forcePasswordChange = user.forcePasswordChange;
                token.id = user.id ?? ""; // Ensure ID is passed
                token.isApplicationAdmin = user.isApplicationAdmin ?? false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.forcePasswordChange = token.forcePasswordChange as boolean;
                session.user.id = token.id as string;
                session.user.isApplicationAdmin = token.isApplicationAdmin as boolean;
            }
            return session;
        }
    },
});

export const { auth, signIn, signOut, handlers } = nextAuthResult;
