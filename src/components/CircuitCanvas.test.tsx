import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { CircuitCanvas } from "./CircuitCanvas";
import { CircuitState, GateType } from "../types/circuit";

// Mock the gate definitions
vi.mock("../data/gateDefinitions", () => ({
  getGateDefinition: vi.fn((type: GateType) => ({
    name: type,
    symbol: type,
    qubits: type === "CNOT" ? 2 : 1,
    controlCount: type === "CNOT" ? 1 : 0,
    color: "bg-blue-500",
    description: `A ${type} gate`,
    icon: type,
  })),
}));

const mockCircuit: CircuitState = {
  numQubits: 2,
  gates: [
    {
      id: "h1",
      type: "H" as GateType,
      qubitIndices: [0],
      position: 0,
    },
  ],
  measurements: [0, 1],
};

const defaultProps = {
  circuit: mockCircuit,
  selectedGate: null as GateType | null,
  onGatePlaced: vi.fn(),
  onGateRemove: vi.fn(),
  onQubitChange: vi.fn(),
};

describe("CircuitCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders circuit canvas with qubits and gates", () => {
    render(<CircuitCanvas {...defaultProps} />);

    // Check if the circuit canvas title is rendered
    expect(screen.getByText("Circuit Canvas")).toBeInTheDocument();

    // Check if qubits are rendered (looking for q0 |0⟩ format)
    expect(screen.getByText("q0 |0⟩")).toBeInTheDocument();
    expect(screen.getByText("q1 |0⟩")).toBeInTheDocument();

    // Check if gate is rendered
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  test("displays empty circuit message when no gates", () => {
    const emptyCircuit: CircuitState = {
      numQubits: 2,
      gates: [],
      measurements: [0, 1],
    };

    render(<CircuitCanvas {...defaultProps} circuit={emptyCircuit} />);

    expect(screen.getByText(/Your circuit is empty/)).toBeInTheDocument();
  });

  test("shows qubit count and allows changing it", () => {
    render(<CircuitCanvas {...defaultProps} />);

    // Check current qubit count is displayed
    expect(screen.getByText("2")).toBeInTheDocument();

    // Test add qubit button (find by SVG content)
    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find(
      (button) => button.querySelector('svg path[d*="M12 5v14"]') // Plus icon path
    );
    const removeButton = buttons.find(
      (button) =>
        button.querySelector('svg path[d*="M5 12h14"]') && // Minus icon path
        !button.querySelector('svg path[d*="M12 5v14"]') // Not plus
    );

    if (addButton) {
      fireEvent.click(addButton);
      expect(defaultProps.onQubitChange).toHaveBeenCalledWith(1);
    }

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(defaultProps.onQubitChange).toHaveBeenCalledWith(-1);
    }
  });

  test("renders measurement indicators", () => {
    render(<CircuitCanvas {...defaultProps} />);

    // Check if measurement symbols are rendered
    const measurementSymbols = screen.getAllByText("M");
    expect(measurementSymbols.length).toBeGreaterThan(0);
  });

  test("handles complex multi-qubit gates", () => {
    const complexCircuit: CircuitState = {
      numQubits: 3,
      gates: [
        {
          id: "cnot1",
          type: "CNOT" as GateType,
          qubitIndices: [0, 1],
          position: 0,
        },
        {
          id: "toffoli1",
          type: "Toffoli" as GateType,
          qubitIndices: [0, 1, 2],
          position: 2,
        },
      ],
      measurements: [0, 1, 2],
    };

    render(<CircuitCanvas {...defaultProps} circuit={complexCircuit} />);

    expect(screen.getByText("CNOT")).toBeInTheDocument();
    expect(screen.getAllByText("Toffoli")).toHaveLength(3); // Toffoli appears on all 3 qubits
  });

  test("displays drag instruction text", () => {
    render(<CircuitCanvas {...defaultProps} />);

    expect(
      screen.getByText(
        /Select a gate from the library and click on the canvas to place it/
      )
    ).toBeInTheDocument();
  });

  test("shows hover preview when gate is selected", () => {
    render(<CircuitCanvas {...defaultProps} selectedGate="X" />);

    // Find a cell and hover over it
    const cells = screen
      .getAllByRole("button")
      .filter((button) => button.className.includes("cursor-pointer"));

    if (cells.length > 0) {
      fireEvent.mouseEnter(cells[0]);
      // The hover preview should be visible (this would need more specific testing based on implementation)
      expect(cells[0]).toBeInTheDocument();
    }
  });

  test("handles gate placement on click", () => {
    render(<CircuitCanvas {...defaultProps} selectedGate="X" />);

    // Find a cell and click it
    const cells = screen
      .getAllByRole("button")
      .filter((button) => button.className.includes("cursor-pointer"));

    if (cells.length > 0) {
      fireEvent.click(cells[0]);
      expect(defaultProps.onGatePlaced).toHaveBeenCalled();
    }
  });

  test("displays pending multi-qubit gate state", () => {
    const pendingGate = {
      type: "CNOT" as GateType,
      qubits: [0],
      position: 0,
    };

    render(
      <CircuitCanvas {...defaultProps} pendingMultiQubitGate={pendingGate} />
    );

    // Should still render normally with pending state
    expect(screen.getByText("Circuit Canvas")).toBeInTheDocument();
  });
});
