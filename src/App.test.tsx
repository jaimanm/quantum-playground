import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App Component", () => {
  test("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText(/build your circuit/i)).toBeInTheDocument();
  });

  test("displays header", () => {
    render(<App />);
    expect(screen.getByText(/quantum circuit builder/i)).toBeInTheDocument();
  });

  test("displays mode toggle buttons", () => {
    render(<App />);
    expect(screen.getByText(/interactive/i)).toBeInTheDocument();
    const codeButtons = screen.getAllByText(/code/i);
    expect(codeButtons.length).toBeGreaterThan(0);
  });

  test("displays quick start guide", () => {
    render(<App />);
    expect(screen.getByText(/quick start guide/i)).toBeInTheDocument();
    expect(screen.getByText(/select gates/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a computer/i)).toBeInTheDocument();
    expect(screen.getByText(/run & explore/i)).toBeInTheDocument();
  });

  test("renders main sections", () => {
    render(<App />);
    expect(screen.getByText(/build your circuit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/create quantum circuits visually or with code/i)
    ).toBeInTheDocument();
  });
});
