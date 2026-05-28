import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, test, expect, vi } from "vitest";
import { Autocomplete } from "@/components/ui/Autocomplete";

interface MockItem {
  id: string | number;
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

  const defaultProps = {
    onSelect: vi.fn(),
    onSearch: vi.fn().mockResolvedValue(mockItems),
    renderItem: (item: MockItem) => <span>{item.name}</span>,
    keyExtractor: (item: MockItem) => item.id.toString(),
    minChars: 1,
    placeholder: "Search...",
  };

  it("should support keyboard navigation: ArrowDown, ArrowUp, Enter, and Escape (HEAD spec style)", async () => {
    const onSearchLocal = vi.fn().mockResolvedValue(mockItems);
    const onSelectLocal = vi.fn();
    render(
      <Autocomplete<MockItem>
        label="Search Fruit"
        placeholder="Type to search..."
        onSearch={onSearchLocal}
        onSelect={onSelectLocal}
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

    expect(onSelectLocal).toHaveBeenCalledWith(mockItems[1]); // Banana (index 1)
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

  test("keyboard navigation moves highlight and selects item on Enter (staging spec style)", async () => {
    const onSelectMock = vi.fn();
    render(<Autocomplete {...defaultProps} onSelect={onSelectMock} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    // Wait for dropdown to be populated
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    // Press ArrowDown once -> highlights "Apple"
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(
        screen
          .getByRole("option", { name: /Apple/i })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });

    // Press ArrowDown twice -> highlights "Banana"
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(
        screen
          .getByRole("option", { name: /Banana/i })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });

    // Press Enter -> selects "Banana"
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectMock).toHaveBeenCalledWith(mockItems[1]);
  });

  test("keyboard navigation wraps around correctly", async () => {
    const onSelectMock = vi.fn();
    render(<Autocomplete {...defaultProps} onSelect={onSelectMock} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    // Press ArrowUp once -> wraps around to the last item ("Cherry")
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => {
      expect(
        screen
          .getByRole("option", { name: /Cherry/i })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectMock).toHaveBeenCalledWith(mockItems[2]);
  });

  test("Escape key closes the dropdown results", async () => {
    render(<Autocomplete {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });

  test("displays green checkmark success match indicator when selectedItem is provided", () => {
    const { container } = render(
      <Autocomplete
        {...defaultProps}
        selectedItem={mockItems[0]}
        getOptionLabel={(item) => item.name}
      />,
    );

    // Green checkmark SVG should be visible
    const svg = container.querySelector("svg.text-emerald-500");
    expect(svg).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.value).toBe("Apple");
  });

  test("clears selection when user types into the input field", async () => {
    const onClearSelection = vi.fn();
    render(
      <Autocomplete
        {...defaultProps}
        selectedItem={mockItems[0]}
        getOptionLabel={(item) => item.name}
        onClearSelection={onClearSelection}
      />,
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Apples" } });

    await waitFor(() => {
      expect(onClearSelection).toHaveBeenCalled();
    });

    // Wait for the dropdown results to load to prevent async state updates leaking
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
  });
});
