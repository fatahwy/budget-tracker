import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type CredentialsUser = { id: string; email: string; clientId: string; defaultAccountId?: string | null; };

type ExtendedJWT = JWT & { id?: string; clientId?: string; defaultAccountId?: string | null; };

function isCredentialsUser(u: unknown): u is CredentialsUser {
  if (typeof u === 'object' && u !== null) {
    const v = u as { id?: unknown; clientId?: unknown; email?: unknown; };
    return typeof v.id === 'string' && typeof v.clientId === 'string' && typeof v.email === 'string';
  }
  return false;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: { username: string; password: string } | undefined) {
        if (!credentials) {
          return null;
        }

        const user = await prisma.user.findFirst({ where: { OR: [ { username: credentials.username }, { email: credentials.username } ] } });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          const u: CredentialsUser = { id: user.id, email: user.email, clientId: user.client_id, defaultAccountId: user.default_account_id ?? null };
          return u;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: unknown }) {
      const t = token as ExtendedJWT;
      if (isCredentialsUser(user)) {
        const u = user;
        t.id = u.id;
        t.clientId = u.clientId;
        const defAcct = u.defaultAccountId;
        if (defAcct) {
          t.defaultAccountId = defAcct;
        }
      } else if (t.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: t.id as string } });
          if (dbUser?.default_account_id) {
            t.defaultAccountId = dbUser.default_account_id;
          }
        } catch {
          // ignore
        }
      }
      return t;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const t = token as ExtendedJWT;
      if (session.user) {
        const sUser = session.user as unknown as { id?: string; clientId?: string; defaultAccountId?: string };
        sUser.id = t.id;
        sUser.clientId = t.clientId;
        if (t.defaultAccountId) {
          sUser.defaultAccountId = t.defaultAccountId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
