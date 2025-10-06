import { render, screen, fireEvent } from "@testing-library/react";
import { ModeToggle } from "./ModeToggle";

describe("ModeToggle Component", () => {
  test("renders correctly", () => {
    render(<ModeToggle mode="interactive" onModeChange={() => {}} />);
    expect(screen.getByText("Interactive")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  test("toggles mode on click", () => {
    const mockOnChange = vi.fn();
    render(<ModeToggle mode="interactive" onModeChange={mockOnChange} />);
    const codeButton = screen.getByText("Code");
    fireEvent.click(codeButton);
    expect(mockOnChange).toHaveBeenCalledWith("code");
  });
});
