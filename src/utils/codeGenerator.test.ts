import { generateCode } from "./codeGenerator";
import { CircuitState } from "../types/circuit";

describe("Code Generator Utility", () => {
  test("should generate valid Qiskit code for a simple circuit", () => {
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
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("from qiskit");
    expect(code).toContain("qc.h(0)");
    expect(code).toContain("qc.measure_all()");
  });

  test("should handle empty circuit", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [],
    };
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("from qiskit");
    expect(code).toContain("# Add gates to your circuit");
  });

  test("should generate code for different frameworks", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [],
    };
    expect(generateCode(circuit, "qiskit")).toContain("qiskit");
    expect(generateCode(circuit, "pennylane")).toContain("pennylane");
    expect(generateCode(circuit, "cirq")).toContain("cirq");
    expect(generateCode(circuit, "qsharp")).toContain("Q#");
    expect(generateCode(circuit, "braket")).toContain("braket");
  });

  test("should return empty string for invalid framework", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [],
    };
    const code = generateCode(circuit, "invalid" as any);
    expect(code).toBe("");
  });

  test("should generate Qiskit code with multiple single-qubit gates", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "x1", type: "X", qubitIndices: [1], position: 1 },
        { id: "y1", type: "Y", qubitIndices: [0], position: 2 },
        { id: "z1", type: "Z", qubitIndices: [1], position: 3 },
      ],
      measurements: [0, 1],
    };
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("qc.h(0)");
    expect(code).toContain("qc.x(1)");
    expect(code).toContain("qc.y(0)");
    expect(code).toContain("qc.z(1)");
  });

  test("should generate Qiskit code with rotation gates", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        {
          id: "rx1",
          type: "RX",
          qubitIndices: [0],
          position: 0,
          params: { angle: Math.PI / 2 },
        },
        {
          id: "ry1",
          type: "RY",
          qubitIndices: [0],
          position: 1,
          params: { angle: Math.PI / 4 },
        },
        {
          id: "rz1",
          type: "RZ",
          qubitIndices: [0],
          position: 2,
          params: { angle: Math.PI },
        },
      ],
      measurements: [0],
    };
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("qc.rx(");
    expect(code).toContain("qc.ry(");
    expect(code).toContain("qc.rz(");
  });

  test("should generate Qiskit code with multi-qubit gates", () => {
    const circuit: CircuitState = {
      numQubits: 3,
      gates: [
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 0 },
        { id: "cz1", type: "CZ", qubitIndices: [1, 2], position: 1 },
        { id: "swap1", type: "SWAP", qubitIndices: [0, 2], position: 2 },
        {
          id: "toffoli1",
          type: "Toffoli",
          qubitIndices: [0, 1, 2],
          position: 3,
        },
      ],
      measurements: [0, 1, 2],
    };
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("qc.cx(0, 1)");
    expect(code).toContain("qc.cz(1, 2)");
    expect(code).toContain("qc.swap(0, 2)");
    expect(code).toContain("qc.ccx(0, 1, 2)");
  });

  test("should generate PennyLane code with gates", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const code = generateCode(circuit, "pennylane");
    expect(code).toContain("qml.Hadamard(wires=0)");
    expect(code).toContain("qml.CNOT(wires=[0, 1])");
    expect(code).toContain("return qml.probs");
  });

  test("should generate Cirq code with gates", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const code = generateCode(circuit, "cirq");
    expect(code).toContain("cirq.H(qubits[0])");
    expect(code).toContain("cirq.CNOT(qubits[0], qubits[1])");
    expect(code).toContain("cirq.measure");
  });

  test("should generate Q# code with gates", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const code = generateCode(circuit, "qsharp");
    expect(code).toContain("H(qubits[0]);");
    expect(code).toContain("CNOT(qubits[0], qubits[1]);");
    expect(code).toContain("MeasureEachZ");
  });

  test("should generate Braket code with gates", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [
        { id: "h1", type: "H", qubitIndices: [0], position: 0 },
        { id: "cnot1", type: "CNOT", qubitIndices: [0, 1], position: 1 },
      ],
      measurements: [0, 1],
    };
    const code = generateCode(circuit, "braket");
    expect(code).toContain("circuit.h(0)");
    expect(code).toContain("circuit.cnot(0, 1)");
  });

  test("should sort gates by position", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        { id: "gate3", type: "Z", qubitIndices: [0], position: 2 },
        { id: "gate1", type: "H", qubitIndices: [0], position: 0 },
        { id: "gate2", type: "X", qubitIndices: [0], position: 1 },
      ],
      measurements: [0],
    };
    const code = generateCode(circuit, "qiskit");
    const hIndex = code.indexOf("qc.h(0)");
    const xIndex = code.indexOf("qc.x(0)");
    const zIndex = code.indexOf("qc.z(0)");
    expect(hIndex).toBeLessThan(xIndex);
    expect(xIndex).toBeLessThan(zIndex);
  });

  test("should handle different qubit counts", () => {
    const circuit1: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [0],
    };
    const circuit3: CircuitState = {
      numQubits: 3,
      gates: [],
      measurements: [0, 1, 2],
    };

    const code1 = generateCode(circuit1, "qiskit");
    const code3 = generateCode(circuit3, "qiskit");

    expect(code1).toContain("QuantumCircuit(1)");
    expect(code3).toContain("QuantumCircuit(3)");
  });

  test("should handle phase gates", () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [
        { id: "s1", type: "S", qubitIndices: [0], position: 0 },
        { id: "t1", type: "T", qubitIndices: [0], position: 1 },
        { id: "sdg1", type: "Sdg", qubitIndices: [0], position: 2 },
        { id: "tdg1", type: "Tdg", qubitIndices: [0], position: 3 },
      ],
      measurements: [0],
    };
    const code = generateCode(circuit, "qiskit");
    expect(code).toContain("qc.s(0)");
    expect(code).toContain("qc.t(0)");
    expect(code).toContain("qc.sdg(0)");
    expect(code).toContain("qc.tdg(0)");
  });
});
