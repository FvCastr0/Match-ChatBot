import { login } from "@/services/login";
import { validateToken } from "@/services/validateToken";
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth" {
  interface User {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Nome", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;

        const result = await login(credentials.name, credentials.password);

        if (result.ok && result.token) {
          return {
            id: credentials.name,
            name: credentials.name,
            accessToken: result.token
          };
        }

        throw new Error(result.msg);
      }
    })
  ],
  jwt: {
    maxAge: 60 * 60
  },
  session: {
    maxAge: 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
      }
      if (!token.accessToken) return {};
      const isValid = await validateToken(token.accessToken);
      if (!isValid) return {};

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/service/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
