import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const providers = [];

if (process.env.MOCK_AUTH === "true") {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Mock Auth",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize() {
        try {
          const user = {
            id: "test-user-id",
            name: "Test Chef",
            email: "test@example.com",
            image: "https://via.placeholder.com/150",
          };

          // Ensure user exists in DB for mock auth
          await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          });

          return user;
        } catch (error) {
          console.error("Mock Auth Error:", error);
          return null;
        }
      },
    }),
  );
} else {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const {
  handlers,
  auth: internalAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (process.env.MOCK_AUTH === "true") return true;

      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});

import { Session } from "next-auth";

export const auth = async (...args: unknown[]): Promise<Session | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (internalAuth as any)(...args);
  if (!session && process.env.MOCK_AUTH === "true") {
    return {
      user: {
        id: "test-user-id",
        name: "Test Chef",
        email: "test@example.com",
        image: "https://via.placeholder.com/150",
      },
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
  return session;
};
