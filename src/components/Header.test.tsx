import { render, screen } from "@testing-library/react";
import { Header } from "./Header";
import { CircuitState, QuantumComputerType } from "../types/circuit";
import { vi } from "vitest";

const mockCircuit: CircuitState = {
  gates: [],
  numQubits: 2,
  measurements: [],
};

const mockProps = {
  circuit: mockCircuit,
  selectedComputer: "simulator" as QuantumComputerType,
  onLoadExample: vi.fn(),
  onRun: vi.fn(),
  onClear: vi.fn(),
  isRunning: false,
};

describe("Header Component", () => {
  test("renders the header", () => {
    render(<Header {...mockProps} />);
    const headerElement = screen.getByText(/Quantum Circuit Builder/i);
    expect(headerElement).toBeInTheDocument();
  });

  test("displays the subtitle", () => {
    render(<Header {...mockProps} />);
    const subtitleElement = screen.getByText(
      /Build, simulate, and explore quantum circuits/i
    );
    expect(subtitleElement).toBeInTheDocument();
  });

  test("displays the zap icon", () => {
    render(<Header {...mockProps} />);
    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });
});

describe("Header Component", () => {
  test("renders the header", () => {
    render(<Header {...mockProps} />);
    const headerElement = screen.getByText(/Quantum Circuit Builder/i);
    expect(headerElement).toBeInTheDocument();
  });

  test("displays the subtitle", () => {
    render(<Header {...mockProps} />);
    const subtitleElement = screen.getByText(
      /Build, simulate, and explore quantum circuits/i
    );
    expect(subtitleElement).toBeInTheDocument();
  });

  test("displays the zap icon", () => {
    render(<Header {...mockProps} />);
    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });
});
