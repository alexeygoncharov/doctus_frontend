import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    access_token: string;
  }

  interface User {
    id: string;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    access_token: string;
  }
}