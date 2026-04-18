import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../app/register/page";
import { expect, test, vi, beforeEach } from "vitest";
import { registerUser } from "../app/register/actions";

vi.mock("../app/register/actions", () => ({
  registerUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders registration form", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i }),
    ).toBeInTheDocument();
  });

  test("shows error message when registration fails", async () => {
    vi.mocked(registerUser).mockResolvedValue({
      error: "Username already exists",
    });
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });

  test("redirects or shows success message on successful registration", async () => {
    vi.mocked(registerUser).mockResolvedValue({ success: true });
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: "newuser",
        password: "password123",
      });
    });
  });
});
