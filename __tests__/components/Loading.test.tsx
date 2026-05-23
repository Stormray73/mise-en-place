import { render, screen } from "@testing-library/react";
import Loading from "@/app/loading";
import { expect, test, describe } from "vitest";

describe("Loading Spinner Component", () => {
  test("renders the progress bar and centered branding spinner", () => {
    render(<Loading />);

    // Brand label CINC
    expect(screen.getByText("CINC")).toBeInTheDocument();

    // Status text
    expect(screen.getByText(/Loading kitchen.../i)).toBeInTheDocument();
  });
});
