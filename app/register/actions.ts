"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { redirect } from "next/navigation";

interface RegisterData {
  username: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const { username, password } = data;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "Username already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    redirect("/login");
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: "A database error occurred. Please try again later." };
  }
}
