import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LikedPosts from "../../src/app/auth/liked/page";
import ResetPassword from "../../src/app/reset-password/page";
import { useAuth } from "../../src/contexts/AuthContext";
import { authService } from "../../src/service/auth/auth";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../src/service/auth/auth", () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

describe("auth flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated users from liked posts to sign in", async () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<LikedPosts />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
    });
  });

  it("shows success feedback after a valid password reset request", async () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    jest.mocked(authService.resetPassword).mockResolvedValue(undefined);

    render(<ResetPassword />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar email/i }));

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        email: "student@example.com",
      });
      expect(
        screen.getByText(/email enviado com sucesso para alterar a senha/i)
      ).toBeInTheDocument();
    });
  });
});
