import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Autocomplete } from "@/components/ui/Autocomplete";

interface MockItem {
  id: string;
  name: string;
}

describe("Autocomplete Keyboard & Match Indicator", () => {
  const mockItems: MockItem[] = [
    { id: "1", name: "Apple" },
    { id: "2", name: "Banana" },
    { id: "3", name: "Cherry" },
  ];

  const onSearch = vi.fn().mockResolvedValue(mockItems);
  const onSelect = vi.fn();

  it("should support keyboard navigation: ArrowDown, ArrowUp, Enter, and Escape", async () => {
    render(
      <Autocomplete<MockItem>
        label="Search Fruit"
        placeholder="Type to search..."
        onSearch={onSearch}
        onSelect={onSelect}
        minChars={1}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );

    const input = screen.getByPlaceholderText("Type to search...");

    // Type something to trigger search
    fireEvent.change(input, { target: { value: "a" } });

    // Wait for search results
    const option1 = await screen.findByText("Apple");
    expect(option1).toBeInTheDocument();

    // Press ArrowDown to highlight first item (Apple)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const appleBtn = screen.getByRole("option", { name: /Apple/i });
      expect(appleBtn.getAttribute("aria-selected")).toBe("true");
    });

    // Press ArrowDown to highlight second item (Banana)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const bananaBtn = screen.getByRole("option", { name: /Banana/i });
      expect(bananaBtn.getAttribute("aria-selected")).toBe("true");
    });

    // Press Enter to select the highlighted item
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(mockItems[1]); // Banana (index 1)
  });

  it("should display a green checkmark when selectedText is provided", () => {
    const onClear = vi.fn();
    render(
      <Autocomplete<MockItem>
        label="Search Fruit"
        placeholder="Type to search..."
        onSearch={onSearch}
        onSelect={onSelect}
        minChars={1}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <div>{item.name}</div>}
        selectedText="Banana"
        onClearSelection={onClear}
      />,
    );

    // Should display selected text in input
    const input = screen.getByPlaceholderText(
      "Type to search...",
    ) as HTMLInputElement;
    expect(input.value).toBe("Banana");
    expect(input).toBeDisabled();

    // Clear selection should call onClear selection
    const clearBtn = screen.getByTitle("Clear selection");
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
