import { render, screen } from "@testing-library/react";
import { ExampleCircuits } from "./ExampleCircuits";

describe("ExampleCircuits", () => {
  test("renders example circuits", () => {
    render(<ExampleCircuits onLoad={() => {}} />);
    expect(screen.getByText(/example circuits/i)).toBeInTheDocument();
  });

  test("displays circuit information", () => {
    render(<ExampleCircuits onLoad={() => {}} />);
    expect(
      screen.getByText(
        /click any example to load it into your circuit builder/i
      )
    ).toBeInTheDocument();
  });

  test("shows tip message", () => {
    render(<ExampleCircuits onLoad={() => {}} />);
    expect(
      screen.getByText(/click any example to load it/i)
    ).toBeInTheDocument();
  });
});
