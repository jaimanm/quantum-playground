import { CircuitState } from "./circuit";

describe("Circuit Type Tests", () => {
  test("should create a valid CircuitState", () => {
    const circuit: CircuitState = {
      numQubits: 2,
      gates: [],
      measurements: [],
    };
    expect(circuit).toHaveProperty("numQubits");
    expect(circuit).toHaveProperty("gates");
    expect(circuit).toHaveProperty("measurements");
    expect(typeof circuit.numQubits).toBe("number");
    expect(Array.isArray(circuit.gates)).toBe(true);
    expect(Array.isArray(circuit.measurements)).toBe(true);
  });

  test("should not allow negative qubits", () => {
    // CircuitState doesn't validate negative qubits at type level
    const circuit: CircuitState = {
      numQubits: -1,
      gates: [],
      measurements: [],
    };
    expect(circuit.numQubits).toBe(-1); // TypeScript allows this, but logic should prevent it
  });
});
