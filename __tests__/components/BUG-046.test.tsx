import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AddPantryItemModal from "@/components/AddPantryItemModal";

// Mock locations action
vi.mock("@/app/dashboard/pantry/location-actions", () => ({
  getLocationsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

describe("BUG-046: AddPantryItemModal Open Food Facts Source Badge", () => {
  it("should render the OFF source badge when search returns Open Food Facts ingredients", async () => {
    // Mock the global fetch
    const mockFoods = [
      {
        fdcId: "off-12345",
        description: "Branded Organic Tomato Paste",
        foodCategory: "Canned Tomatoes",
        source: "OFF",
      },
      {
        fdcId: "usda-54321",
        description: "Fresh Heirloom Tomatoes",
        foodCategory: "Vegetables",
        source: "USDA",
      },
    ];

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ foods: mockFoods }),
    } as Response);

    const onAdd = vi.fn();
    const onClose = vi.fn();

    render(<AddPantryItemModal onClose={onClose} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("Search USDA...");
    expect(input).toBeInTheDocument();

    // Type query to trigger autocomplete search
    fireEvent.change(input, { target: { value: "Tomato" } });

    // Wait for autocomplete items to show up
    await waitFor(() => {
      expect(
        screen.getByText("Branded Organic Tomato Paste"),
      ).toBeInTheDocument();
    });

    // Check that source badges "OFF" and "USDA" are visible in the dropdown list options
    const offBadge = screen.getByText("OFF");
    const usdaBadge = screen.getByText("USDA");
    expect(offBadge).toBeInTheDocument();
    expect(usdaBadge).toBeInTheDocument();

    globalFetch.mockRestore();
  });
});
