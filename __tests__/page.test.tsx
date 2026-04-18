import { render, screen } from "@testing-library/react";
import Home from "../app/page";
import { expect, test } from "vitest";

test("Home page renders Get Started link", () => {
  render(<Home />);
  const getStartedLink = screen.getByRole("link", { name: /Get Started/i });
  expect(getStartedLink).toBeInTheDocument();
});
