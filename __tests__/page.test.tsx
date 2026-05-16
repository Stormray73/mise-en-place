import { render, screen } from "@testing-library/react";
import Home from "../app/page";
import { expect, test } from "vitest";

test("Home page renders Start Cooking Free link", () => {
  render(<Home />);
  const getStartedLink = screen.getByRole("link", {
    name: /Start Cooking Free/i,
  });
  expect(getStartedLink).toBeInTheDocument();
});
