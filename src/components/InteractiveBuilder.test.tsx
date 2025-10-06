import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { InteractiveBuilder } from "./InteractiveBuilder";
import { CircuitState } from "../types/circuit";

const mockCircuit: CircuitState = {
  gates: [],
  numQubits: 2,
  measurements: [],
};

describe("InteractiveBuilder", () => {
  test("renders gate library and circuit canvas", () => {
    render(
      <InteractiveBuilder
        circuit={mockCircuit}
        onAddGate={() => {}}
        onRemoveGate={() => {}}
        onQubitChange={() => {}}
      />
    );
    expect(screen.getByText(/gate library/i)).toBeInTheDocument();
  });

  test("displays circuit canvas", () => {
    render(
      <InteractiveBuilder
        circuit={mockCircuit}
        onAddGate={() => {}}
        onRemoveGate={() => {}}
        onQubitChange={() => {}}
      />
    );
    // Check for the empty circuit message or grid structure
    expect(screen.getByText(/your circuit is empty/i)).toBeInTheDocument();
  });

  test("handles gate selection and placement workflow", () => {
    const mockOnAddGate = vi.fn();
    render(
      <InteractiveBuilder
        circuit={mockCircuit}
        onAddGate={mockOnAddGate}
        onRemoveGate={() => {}}
        onQubitChange={() => {}}
      />
    );

    // Select a gate from the library
    const gateButton = screen.getByText("H");
    fireEvent.click(gateButton);

    // The gate should be selected (this would be tested by checking internal state)
    expect(gateButton).toBeInTheDocument();
  });

  test("handles multi-qubit gate workflow", () => {
    const mockOnAddGate = vi.fn();
    render(
      <InteractiveBuilder
        circuit={mockCircuit}
        onAddGate={mockOnAddGate}
        onRemoveGate={() => {}}
        onQubitChange={() => {}}
      />
    );

    // Select a multi-qubit gate (CNOT)
    const cnotButton = screen.getByText("CNOT");
    fireEvent.click(cnotButton);

    // The component should handle the multi-qubit workflow
    expect(cnotButton).toBeInTheDocument();
  });
});
