import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecipeEditor } from "@/components/RecipeEditor";
import * as actions from "@/app/recipes/actions";

// Mock router and params
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

// Mock the actions
vi.mock("@/app/recipes/actions", () => ({
  saveRecipeAction: vi.fn(),
  getTagsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  checkR2ConfiguredAction: vi.fn().mockResolvedValue(true),
  importRecipeAction: vi.fn(),
  getPresignedUploadUrlAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      uploadUrl: "https://r2.test-upload.com/tmp/test-image.jpg?signed=true",
      publicUrl: "https://custom-domain.com/tmp/test-image.jpg",
      key: "tmp/test-image.jpg",
    },
  }),
}));

describe("BUG-047: RecipeEditor Large Image Direct R2 Upload", () => {
  it("should bypass Next.js API route by calling getPresignedUploadUrlAction and PUTting to R2", async () => {
    // Spy on global fetch
    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const { container } = render(<RecipeEditor />);

    // Wait for the file input to appear in the DOM (async checkR2ConfiguredAction effect)
    let fileInput: HTMLInputElement | null = null;
    await waitFor(() => {
      fileInput = container.querySelector("input[type='file']");
      expect(fileInput).not.toBeNull();
    });

    // Create a mock large file (4.8MB)
    const largeFile = new File(
      ["a".repeat(4.8 * 1024 * 1024)],
      "large-recipe-image.jpg",
      {
        type: "image/jpeg",
      },
    );

    // Simulate selecting the file
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Wait for the upload action to be called
    await waitFor(() => {
      expect(actions.getPresignedUploadUrlAction).toHaveBeenCalledWith(
        "large-recipe-image.jpg",
        "image/jpeg",
      );
    });

    // Check that direct R2 PUT upload was performed via fetch
    await waitFor(() => {
      expect(globalFetch).toHaveBeenCalledWith(
        "https://r2.test-upload.com/tmp/test-image.jpg?signed=true",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: largeFile,
        }),
      );
    });

    globalFetch.mockRestore();
  });

  it("should bypass Next.js API route in ImportRecipeModal by uploading directly to R2 first", async () => {
    // Lazy import or regular import
    const { default: ImportRecipeModal } =
      await import("@/components/ImportRecipeModal");

    // Spy on global fetch
    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const onClose = vi.fn();
    const { container, getByRole, getByText } = render(
      <ImportRecipeModal onClose={onClose} />,
    );

    // Switch to File tab
    const fileTabBtn = getByRole("button", { name: /^file$/i });
    fireEvent.click(fileTabBtn);

    // Get the file input
    const fileInput = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Create a mock large image file (4.8MB)
    const largeFile = new File(
      ["a".repeat(4.8 * 1024 * 1024)],
      "large-import-image.jpg",
      {
        type: "image/jpeg",
      },
    );

    // Simulate selecting the file
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Mock importRecipeAction response
    const mockImportResult = {
      success: true,
      data: {
        recipes: [{ title: "Imported Recipe" }],
        type: "single" as const,
      },
    };
    vi.mocked(actions.importRecipeAction).mockResolvedValue(mockImportResult);

    // Click Import
    const importBtn = getByRole("button", { name: /^import$/i });
    fireEvent.click(importBtn);

    // Verify loading spinner & progress messages appear
    await waitFor(() => {
      expect(getByText(/Uploading image to storage.../i)).toBeInTheDocument();
    });

    // Wait for getPresignedUploadUrlAction to be called
    await waitFor(() => {
      expect(actions.getPresignedUploadUrlAction).toHaveBeenCalledWith(
        "large-import-image.jpg",
        "image/jpeg",
      );
    });

    // Check that direct R2 PUT upload was performed
    await waitFor(() => {
      expect(globalFetch).toHaveBeenCalledWith(
        "https://r2.test-upload.com/tmp/test-image.jpg?signed=true",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: largeFile,
        }),
      );
    });

    // Check that importRecipeAction is called with imageUrl in formData and does NOT contain file
    await waitFor(() => {
      expect(actions.importRecipeAction).toHaveBeenCalled();
    });

    const calledFormData = vi.mocked(actions.importRecipeAction).mock
      .calls[0][0];
    expect(calledFormData.get("imageUrl")).toBe(
      "https://custom-domain.com/tmp/test-image.jpg",
    );
    expect(calledFormData.get("file")).toBeNull();

    globalFetch.mockRestore();
  });
});
