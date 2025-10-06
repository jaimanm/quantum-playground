import { render, screen, fireEvent } from "@testing-library/react";
import { ResultsVisualization } from "./ResultsVisualization";
import { ExecutionResult } from "../types/circuit";

const mockResult: ExecutionResult = {
  executionId: "test-123",
  circuit: {
    numQubits: 2,
    gates: [],
    measurements: [],
  },
  quantumComputer: "simulator",
  expectedResults: {
    stateVector: {
      amplitudes: [],
      probabilities: [0.5, 0, 0, 0.5], // |00⟩ and |11⟩ states
    },
    probabilities: { "00": 0.5, "11": 0.5 },
  },
  actualResults: {
    measurements: [
      { state: "00", count: 500, probability: 0.5 },
      { state: "11", count: 500, probability: 0.5 },
    ],
    shots: 1000,
  },
  metadata: {
    executionTime: 100,
    circuitDepth: 2,
    gateCount: 1,
    timestamp: new Date().toISOString(),
  },
};

describe("ResultsVisualization Component", () => {
  test("renders without crashing", () => {
    render(<ResultsVisualization result={mockResult} onClose={() => {}} />);
    expect(screen.getByText(/circuit results/i)).toBeInTheDocument();
  });

  test("displays correct data", () => {
    render(<ResultsVisualization result={mockResult} onClose={() => {}} />);
    expect(screen.getByText("1000")).toBeInTheDocument(); // shots
    const depthElements = screen.getAllByText("2");
    expect(depthElements.length).toBeGreaterThan(0); // circuit depth appears at least once
  });

  test("handles close button", () => {
    const mockOnClose = vi.fn();
    render(<ResultsVisualization result={mockResult} onClose={mockOnClose} />);
    const closeButton = screen.getByText(/close results/i);
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
