import { render, screen, fireEvent } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";
import { CircuitState } from "../types/circuit";

const mockCircuit: CircuitState = {
  gates: [],
  numQubits: 2,
  measurements: [],
};

describe("CodeEditor Component", () => {
  test("renders without crashing", () => {
    render(
      <CodeEditor
        circuit={mockCircuit}
        framework="qiskit"
        onFrameworkChange={() => {}}
      />
    );
    expect(screen.getByText(/framework/i)).toBeInTheDocument();
  });

  test("handles framework changes", () => {
    const mockOnChange = vi.fn();
    render(
      <CodeEditor
        circuit={mockCircuit}
        framework="qiskit"
        onFrameworkChange={mockOnChange}
      />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "pennylane" } });
    expect(mockOnChange).toHaveBeenCalledWith("pennylane");
  });

  test("displays copy button", () => {
    render(
      <CodeEditor
        circuit={mockCircuit}
        framework="qiskit"
        onFrameworkChange={() => {}}
      />
    );
    expect(screen.getByText(/copy code/i)).toBeInTheDocument();
  });
});
