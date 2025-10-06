import { render, screen, fireEvent } from "@testing-library/react";
import { GateLibrary } from "./GateLibrary";

describe("GateLibrary", () => {
  test("displays gate library title", () => {
    render(<GateLibrary onGateSelect={() => {}} />);
    expect(screen.getByText(/gate library/i)).toBeInTheDocument();
  });

  test("displays gate categories", () => {
    render(<GateLibrary onGateSelect={() => {}} />);
    expect(screen.getByText(/single qubit gates/i)).toBeInTheDocument();
    expect(screen.getByText(/rotation gates/i)).toBeInTheDocument();
    expect(screen.getByText(/multi-qubit gates/i)).toBeInTheDocument();
  });

  test("handles gate selection", () => {
    const mockOnSelect = vi.fn();
    render(<GateLibrary onGateSelect={mockOnSelect} />);
    // Find a gate button (Hadamard gate should be present)
    const gateButton = screen.getByText("H");
    fireEvent.click(gateButton);
    expect(mockOnSelect).toHaveBeenCalledWith("H");
  });
});
