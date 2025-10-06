import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders main application components", () => {
  render(<App />);
  // Check for main heading
  expect(screen.getByText(/build your circuit/i)).toBeInTheDocument();
  // Check for mode toggle buttons
  expect(screen.getByText(/interactive/i)).toBeInTheDocument();
  const codeButtons = screen.getAllByText(/code/i);
  expect(codeButtons.length).toBeGreaterThan(0);
  // Check for quick start guide
  expect(screen.getByText(/quick start guide/i)).toBeInTheDocument();
});
