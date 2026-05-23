import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { expect, test, vi, describe } from "vitest";

describe("Autocomplete Keyboard Navigation & Selection Matcher", () => {
  const items = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
  ];

  const defaultProps = {
    onSelect: vi.fn(),
    onSearch: vi.fn().mockResolvedValue(items),
    renderItem: (item: { id: number; name: string }) => (
      <span>{item.name}</span>
    ),
    keyExtractor: (item: { id: number; name: string }) => item.id.toString(),
    minChars: 1,
    placeholder: "Search...",
  };

  test("keyboard navigation moves highlight and selects item on Enter", async () => {
    const onSelect = vi.fn();
    render(<Autocomplete {...defaultProps} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    // Wait for dropdown to be populated
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    // Press ArrowDown once -> highlights "Apple"
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press ArrowDown twice -> highlights "Banana"
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press Enter -> selects "Banana"
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  test("keyboard navigation wraps around correctly", async () => {
    const onSelect = vi.fn();
    render(<Autocomplete {...defaultProps} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "a" } });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    // Press ArrowUp once -> wraps around to the last item ("Cherry")
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(items[2]);
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
        selectedItem={items[0]}
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
        selectedItem={items[0]}
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
