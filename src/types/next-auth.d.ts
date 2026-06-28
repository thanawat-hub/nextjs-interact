import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: 'admin' | 'member';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: 'admin' | 'member';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    role: 'admin' | 'member';
  }
}
