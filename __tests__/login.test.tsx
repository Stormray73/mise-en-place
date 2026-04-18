import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "@/app/login/page";
import { expect, test, vi, describe, beforeEach } from "vitest";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders login form with username and password fields", () => {
    render(<Login />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
  });

  test("submits form with username and password", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    vi.mocked(signIn).mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        username: "testuser",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error message on invalid credentials", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: "CredentialsSignin",
      status: 401,
      ok: false,
      url: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
