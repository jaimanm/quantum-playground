import { render, screen, fireEvent } from "@testing-library/react";
import { QuantumComputerSelector } from "./QuantumComputerSelector";

describe("QuantumComputerSelector", () => {
  it("renders correctly", () => {
    render(
      <QuantumComputerSelector selected="simulator" onSelect={() => {}} />
    );
    expect(screen.getByText(/select quantum computer/i)).toBeInTheDocument();
  });

  it("updates state when a quantum computer is selected", () => {
    const mockOnSelect = vi.fn();
    render(
      <QuantumComputerSelector selected="simulator" onSelect={mockOnSelect} />
    );
    const computerButton = screen.getByText("Quantum Simulator");
    fireEvent.click(computerButton);
    expect(mockOnSelect).toHaveBeenCalledWith("simulator");
  });
});
