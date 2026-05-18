import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { Role, Tier } from "@prisma/client";

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
            role: "ADMIN" as const,
            tier: "PRO" as const,
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
              role: "ADMIN",
              tier: "PRO",
            },
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return user as any;
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
    async authorized({ auth, request: { nextUrl } }) {
      if (process.env.MOCK_AUTH === "true") return true;

      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        return isLoggedIn && auth?.user?.role === "ADMIN";
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async signIn({ user }) {
      if (
        user.email &&
        process.env.FIRST_ADMIN_EMAIL &&
        user.email === process.env.FIRST_ADMIN_EMAIL
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser && dbUser.role !== "ADMIN") {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN" },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, tier: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.tier = dbUser.tier;
        }
      }
      if (trigger === "update" && session) {
        token.role = session.user.role;
        token.tier = session.user.tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.tier = token.tier as string;
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
    const user = {
      id: "test-user-id",
      name: "Test Chef",
      email: "test@example.com",
      image: "https://via.placeholder.com/150",
      role: "ADMIN" as const,
      tier: "PRO" as const,
    };

    // Ensure user exists in DB for mock auth shortcut
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: user as any,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
  return session;
};
