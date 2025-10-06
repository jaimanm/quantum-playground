import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { ExecutionPanel } from "./ExecutionPanel";
import { CircuitState, QuantumComputerType } from "../types/circuit";

// Mock the quantum computers data
vi.mock("../data/quantumComputers", () => ({
  getQuantumComputer: vi.fn((type) => ({
    name: type === "simulator" ? "Local Simulator" : "IBM Quantum Computer",
    type: type,
    qubits: 5,
    description: "A quantum computer",
  })),
}));

const mockCircuit: CircuitState = {
  numQubits: 2,
  gates: [
    {
      id: "h1",
      type: "H" as any,
      qubitIndices: [0],
      position: 0,
    },
  ],
  measurements: [0, 1],
};

const emptyCircuit: CircuitState = {
  numQubits: 2,
  gates: [],
  measurements: [0, 1],
};

const defaultProps = {
  circuit: mockCircuit,
  selectedComputer: "simulator" as QuantumComputerType,
  onRun: vi.fn(),
  onClear: vi.fn(),
  onCompact: vi.fn(),
  isRunning: false,
};

describe("ExecutionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders execution panel with circuit stats", () => {
    render(<ExecutionPanel {...defaultProps} />);

    expect(screen.getByText("Circuit Controls")).toBeInTheDocument();
    expect(screen.getByText("Gates:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Number of gates
    expect(screen.getByText("Qubits:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Number of qubits
    expect(screen.getByText("Local Simulator")).toBeInTheDocument();
  });

  test("shows run button enabled when circuit has gates", () => {
    render(<ExecutionPanel {...defaultProps} />);

    const runButton = screen
      .getByText("Run Circuit")
      .closest("button") as HTMLButtonElement;
    expect(runButton).toBeInTheDocument();
    expect(runButton).not.toBeDisabled();
  });

  test("shows run button disabled when circuit is empty", () => {
    render(<ExecutionPanel {...defaultProps} circuit={emptyCircuit} />);

    const runButton = screen
      .getByText("Run Circuit")
      .closest("button") as HTMLButtonElement;
    expect(runButton).toBeDisabled();
  });

  test("shows running state when isRunning is true", () => {
    render(<ExecutionPanel {...defaultProps} isRunning={true} />);

    expect(screen.getByText("Running...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /running/i })).toBeDisabled();
  });

  test("calls onRun when run button is clicked", () => {
    render(<ExecutionPanel {...defaultProps} />);

    const runButton = screen
      .getByText("Run Circuit")
      .closest("button") as HTMLButtonElement;
    fireEvent.click(runButton);

    expect(defaultProps.onRun).toHaveBeenCalledTimes(1);
  });

  test("calls onClear when clear button is clicked", () => {
    render(<ExecutionPanel {...defaultProps} />);

    const clearButton = screen
      .getByText("Clear")
      .closest("button") as HTMLButtonElement;
    fireEvent.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  test("calls onCompact when compact button is clicked", () => {
    render(<ExecutionPanel {...defaultProps} />);

    const compactButton = screen
      .getByText("Compact")
      .closest("button") as HTMLButtonElement;
    fireEvent.click(compactButton);

    expect(defaultProps.onCompact).toHaveBeenCalledTimes(1);
  });

  test("disables buttons when running", () => {
    render(<ExecutionPanel {...defaultProps} isRunning={true} />);

    const clearButton = screen
      .getByText("Clear")
      .closest("button") as HTMLButtonElement;
    const compactButton = screen
      .getByText("Compact")
      .closest("button") as HTMLButtonElement;

    expect(clearButton).toBeDisabled();
    expect(compactButton).toBeDisabled();
  });

  test("shows warning message when circuit is empty", () => {
    render(<ExecutionPanel {...defaultProps} circuit={emptyCircuit} />);

    expect(
      screen.getByText(/Add some gates to your circuit/)
    ).toBeInTheDocument();
  });

  test("displays different computer names based on selection", () => {
    render(
      <ExecutionPanel {...defaultProps} selectedComputer="superconducting" />
    );

    expect(screen.getByText("IBM Quantum Computer")).toBeInTheDocument();
  });

  test("compact button spans full width when onCompact is not provided", () => {
    const propsWithoutCompact = {
      ...defaultProps,
      onCompact: undefined,
    };

    render(<ExecutionPanel {...propsWithoutCompact} />);

    const clearButton = screen.getByText("Clear");
    // The clear button should be full width when no compact button
    expect(clearButton.closest("button")).toHaveClass("col-span-2");
  });
});
