import { renderHook, act } from "@testing-library/react";
import { useCircuit } from "./useCircuit";

describe("useCircuit", () => {
  test("should initialize with default values", () => {
    const { result } = renderHook(() => useCircuit());
    expect(result.current.circuit.numQubits).toBe(2);
    expect(result.current.circuit.gates).toEqual([]);
    expect(result.current.circuit.measurements).toEqual([]);
    expect(result.current.viewMode).toBe("interactive");
    expect(result.current.codeFramework).toBe("qiskit");
    expect(result.current.selectedQuantumComputer).toBe("simulator");
  });

  test("should add a gate to the circuit", () => {
    const { result } = renderHook(() => useCircuit());
    act(() => {
      result.current.addGate("H", [0], 0);
    });
    expect(result.current.circuit.gates).toHaveLength(1);
    expect(result.current.circuit.gates[0].type).toBe("H");
    expect(result.current.circuit.gates[0].qubitIndices).toEqual([0]);
    expect(result.current.circuit.gates[0].position).toBe(0);
  });

  test("should remove a gate from the circuit", () => {
    const { result } = renderHook(() => useCircuit());
    act(() => {
      result.current.addGate("H", [0], 0);
    });
    const gateId = result.current.circuit.gates[0].id;
    act(() => {
      result.current.removeGate(gateId);
    });
    expect(result.current.circuit.gates).toHaveLength(0);
  });

  test("should clear the circuit", () => {
    const { result } = renderHook(() => useCircuit());
    act(() => {
      result.current.addGate("H", [0], 0);
    });
    act(() => {
      result.current.clearCircuit();
    });
    expect(result.current.circuit.gates).toEqual([]);
    expect(result.current.circuit.measurements).toEqual([]);
  });

  test("should set the number of qubits", () => {
    const { result } = renderHook(() => useCircuit());
    act(() => {
      result.current.setNumQubits(3);
    });
    expect(result.current.circuit.numQubits).toBe(3);
  });

  test("should load a circuit", () => {
    const { result } = renderHook(() => useCircuit());
    const newCircuit = {
      numQubits: 3,
      gates: [
        { id: "test-gate", type: "X" as const, qubitIndices: [0], position: 0 },
      ],
      measurements: [],
    };
    act(() => {
      result.current.loadCircuit(newCircuit);
    });
    expect(result.current.circuit).toEqual(newCircuit);
  });
});
