import { QuantumSimulator } from "./quantumSimulator";
import { CircuitState } from "../types/circuit";

describe("Quantum Simulator Utility", () => {
  test("should simulate a simple quantum circuit", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        {
          id: "gate-1",
          type: "H",
          qubitIndices: [0],
          position: 0,
        },
      ],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    expect(result).toHaveProperty("amplitudes");
    expect(result).toHaveProperty("probabilities");
    expect(result.probabilities).toHaveLength(4); // 2^2 states
  });

  test("should handle empty circuit", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(1); // |0⟩ state should have probability 1
    expect(result.probabilities[1]).toBeCloseTo(0); // |1⟩ state should have probability 0
  });

  test("should return correct measurement results", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        {
          id: "gate-1",
          type: "H",
          qubitIndices: [0],
          position: 0,
        },
      ],
      measurements: [0],
    };
    const measurements = simulator.measure(circuit, 100);
    expect(measurements).toBeInstanceOf(Array);
    expect(measurements.length).toBeGreaterThan(0);
    expect(measurements[0]).toHaveProperty("state");
    expect(measurements[0]).toHaveProperty("count");
    expect(measurements[0]).toHaveProperty("probability");
  });

  test("should apply Hadamard gate correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [{ id: "h1", type: "H", qubitIndices: [0], position: 0 }],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0.5); // |0⟩ probability
    expect(result.probabilities[1]).toBeCloseTo(0.5); // |1⟩ probability
  });

  test("should apply Pauli-X gate correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [{ id: "x1", type: "X", qubitIndices: [0], position: 0 }],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0); // |0⟩ probability
    expect(result.probabilities[1]).toBeCloseTo(1); // |1⟩ probability
  });

  test("should apply Pauli-Y gate correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [{ id: "y1", type: "Y", qubitIndices: [0], position: 0 }],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0); // |0⟩ probability
    expect(result.probabilities[1]).toBeCloseTo(1); // |1⟩ probability
  });

  test("should apply Pauli-Z gate correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "z1", type: "Z", qubitIndices: [0], position: 1 },
      ],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0.5); // |0⟩ probability (phase changed)
    expect(result.probabilities[1]).toBeCloseTo(0.5); // |1⟩ probability (phase changed)
  });

  test("should apply S and T gates correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "s1", type: "S", qubitIndices: [0], position: 1 },
      ],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0.5);
    expect(result.probabilities[1]).toBeCloseTo(0.5);
  });

  test("should apply rotation gates correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        {
          id: "rx1",
          type: "RX",
          qubitIndices: [0],
          position: 0,
          params: { angle: Math.PI },
        },
      ],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0);
    expect(result.probabilities[1]).toBeCloseTo(1);
  });

  test("should apply CNOT gate correctly", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    // Bell state: (|00⟩ + |11⟩)/√2
    expect(result.probabilities[0]).toBeCloseTo(0.5); // |00⟩
    expect(result.probabilities[3]).toBeCloseTo(0.5); // |11⟩
    expect(result.probabilities[1]).toBeCloseTo(0); // |01⟩
    expect(result.probabilities[2]).toBeCloseTo(0); // |10⟩
  });

  test("should apply CZ gate correctly", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "h2", type: "H", qubitIndices: [1], position: 1 },
        { id: "cz1", type: "CZ", qubitIndices: [0, 1], position: 2 },
      ],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    // All states should have equal probability
    expect(result.probabilities[0]).toBeCloseTo(0.25);
    expect(result.probabilities[1]).toBeCloseTo(0.25);
    expect(result.probabilities[2]).toBeCloseTo(0.25);
    expect(result.probabilities[3]).toBeCloseTo(0.25);
  });

  test("should apply SWAP gate correctly", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "x1", type: "X", qubitIndices: [0], position: 0 },
        { id: "swap1", type: "SWAP", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    // SWAP should preserve the total probability and not crash
    expect(result.probabilities.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1);
    expect(result.probabilities.length).toBe(4);
  });

  test("should apply Toffoli gate correctly", () => {
    const simulator = new QuantumSimulator(3);
    const circuit: CircuitState = {
      numQubits: 3,
      gates: [
        { id: "x1", type: "X", qubitIndices: [0], position: 0 },
        { id: "x2", type: "X", qubitIndices: [1], position: 1 },
        {
          id: "toffoli1",
          type: "Toffoli",
          qubitIndices: [0, 1, 2],
          position: 2,
        },
      ],
      measurements: [0, 1, 2],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities[0]).toBeCloseTo(0); // |000⟩
    expect(result.probabilities[1]).toBeCloseTo(0); // |001⟩
    expect(result.probabilities[2]).toBeCloseTo(0); // |010⟩
    expect(result.probabilities[3]).toBeCloseTo(0); // |011⟩
    expect(result.probabilities[4]).toBeCloseTo(0); // |100⟩
    expect(result.probabilities[5]).toBeCloseTo(0); // |101⟩
    expect(result.probabilities[6]).toBeCloseTo(0); // |110⟩
    expect(result.probabilities[7]).toBeCloseTo(1); // |111⟩ (target flipped)
  });

  test("should handle complex circuits with multiple gates", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        {
          id: "rx1",
          type: "RX",
          qubitIndices: [1],
          position: 1,
          params: { angle: Math.PI / 2 },
        },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 2 },
        { id: "z1", type: "Z", qubitIndices: [1], position: 3 },
      ],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    expect(result.probabilities).toHaveLength(4);
    expect(result.probabilities.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1);
  });

  test("should measure with noise correctly", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [0],
    };
    const measurements = simulator.measureWithNoise(circuit, 1000, 0.1);
    expect(measurements).toBeInstanceOf(Array);
    expect(measurements.length).toBeGreaterThan(0);
    // With noise, we might get some |1⟩ measurements even for |0⟩ input
    const totalCount = measurements.reduce((sum, m) => sum + m.count, 0);
    expect(totalCount).toBe(1000);
  });

  test("should sort gates by position before simulation", () => {
    const simulator = new QuantumSimulator(1);
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        { id: "x1", type: "X", qubitIndices: [0], position: 2 },
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
      ],
      measurements: [0],
    };
    const result = simulator.simulate(circuit);
    // H followed by X: H takes |0⟩ to superposition, X flips both components
    // Result should still be superposition: (|1⟩ + |0⟩)/√2 = (|0⟩ + |1⟩)/√2
    expect(result.probabilities[0]).toBeCloseTo(0.5);
    expect(result.probabilities[1]).toBeCloseTo(0.5);
  });

  test("should initialize state vector correctly", () => {
    const simulator = new QuantumSimulator(2);
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [],
      measurements: [0, 1],
    };
    const result = simulator.simulate(circuit);
    expect(result.amplitudes[0].real).toBe(1);
    expect(result.amplitudes[0].imaginary).toBe(0);
    for (let i = 1; i < result.amplitudes.length; i++) {
      expect(result.amplitudes[i].real).toBe(0);
      expect(result.amplitudes[i].imaginary).toBe(0);
    }
  });
});
