import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

test("LoadingScreen displays correctly during loading states", () => {
  render(<LoadingScreen computerType="simulator" progress={50} />);
  expect(screen.getByText(/simulating quantum circuit/i)).toBeInTheDocument();
});

test("LoadingScreen shows progress", () => {
  render(<LoadingScreen computerType="simulator" progress={75} />);
  expect(
    screen.getByText(/your quantum circuit is being executed/i)
  ).toBeInTheDocument();
});
