import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const authHandler = NextAuth(authConfig).auth;
export default authHandler;
export const proxy = authHandler;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
