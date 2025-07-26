import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string | null;
  }
}
