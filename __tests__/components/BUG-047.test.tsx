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
});
