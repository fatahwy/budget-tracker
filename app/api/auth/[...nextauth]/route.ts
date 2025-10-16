import NextAuth, { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const user = await prisma.user.findFirst({ where: { OR: [ { username: credentials.username }, { email: credentials.username } ] } } as any) as any;

        console.log({user});
        

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, default_account_id: user.default_account_id, email: user.email, clientId: user.client_id } as any;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User & { clientId: string } | undefined }) {
      if (user) {
        token.id = user.id;
        token.clientId = user.clientId;
        const defAcct = (user as any).default_account_id;
        if (defAcct) {
          (token as any).defaultAccountId = defAcct;
        }
      } else if (token?.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (dbUser?.default_account_id) {
            (token as any).defaultAccountId = dbUser.default_account_id;
          }
        } catch {
          // ignore
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.clientId = token.clientId as string;
        (session.user as any).defaultAccountId = (token as any).defaultAccountId;
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
