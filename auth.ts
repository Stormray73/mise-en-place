import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const {
  handlers,
  auth: internalAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      if (process.env.ENABLE_MSW === "true") return true;

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

let mockUserInitialized = false;

export const auth = async (...args: unknown[]): Promise<Session | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (internalAuth as any)(...args);

  if (!session && process.env.ENABLE_MSW === "true") {
    // If MSW is active and session is missing, provide a mock session
    // This allows bypass of the brittle OAuth redirect loop in E2E tests
    // while keeping production code 99% pure.
    const user = {
      id: "test-user-id",
      name: "Test Chef",
      email: "test@example.com",
      image: "https://via.placeholder.com/150",
      role: "ADMIN" as const,
      tier: "PRO" as const,
    };

    if (!mockUserInitialized) {
      try {
        // Ensure user exists in DB
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
        mockUserInitialized = true;
      } catch (e) {
        console.error("Failed to initialize mock user:", e);
        // Don't set mockUserInitialized to true, try again next time
      }
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: user as any,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  return session;
};
