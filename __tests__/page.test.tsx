import { render, screen } from "@testing-library/react";
import Home from "../app/page";
import { expect, test } from "vitest";

test("Home page renders deploy link", () => {
  render(<Home />);
  const deployLink = screen.getByRole("link", { name: /Deploy Now/i });
  expect(deployLink).toBeInTheDocument();
});
