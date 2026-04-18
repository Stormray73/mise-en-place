import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser } from "../app/register/actions";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

describe("registerUser action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if password is too short", async () => {
    const result = await registerUser({
      username: "testuser",
      password: "123",
    });
    expect(result.error).toBe("Password must be at least 8 characters long");
  });

  it("should fail if username already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      username: "testuser",
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser({
      username: "testuser",
      password: "password123",
    });
    expect(result.error).toBe("Username already exists");
  });

  it("should create a user if data is valid", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "1",
      username: "testuser",
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // redirect() throws an error that Next.js handles,
    // we should expect this error in our test.
    await expect(
      registerUser({ username: "testuser", password: "password123" }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(prisma.user.create).toHaveBeenCalled();
  });
});
