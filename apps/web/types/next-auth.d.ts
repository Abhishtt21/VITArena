import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    token: string;
    role: string;
  }

  interface Session {
    user: User & {
      jwtToken: string;
    }
  }
}


