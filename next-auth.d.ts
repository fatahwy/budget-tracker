import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      clientId: string;
    } & DefaultSession['user'];
  }

  interface User {
    clientId: string;
  }
}
