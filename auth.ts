import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const providers = [];

if (process.env.MOCK_AUTH === "true") {
  providers.push(
    Credentials({
      name: "Mock Auth",
      credentials: {},
      async authorize() {
        // Return a mock user for testing.
        // This only executes if MOCK_AUTH=true is set in the environment.
        const user = {
          id: "test-user-id",
          name: "Test Chef",
          email: "test@example.com",
          image: "https://via.placeholder.com/150",
        };

        // Ensure user exists in DB for foreign key relations
        await prisma.user.upsert({
          where: { id: user.id },
          update: { name: user.name, email: user.email },
          create: user,
        });

        return user;
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
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
