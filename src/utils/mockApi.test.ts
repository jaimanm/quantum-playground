import { executeCircuit } from "./mockApi";
import { CircuitState } from "../types/circuit";

describe("executeCircuit function", () => {
  test("should execute a simple circuit", async () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [0],
    };

    const result = await executeCircuit(circuit, "simulator");
    expect(result).toHaveProperty("executionId");
    expect(result).toHaveProperty("circuit");
    expect(result).toHaveProperty("quantumComputer", "simulator");
    expect(result).toHaveProperty("expectedResults");
    expect(result).toHaveProperty("actualResults");
    expect(result).toHaveProperty("metadata");
  });

  test("should handle circuit with gates", async () => {
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

    const result = await executeCircuit(circuit, "simulator");
    expect(result.circuit.gates).toHaveLength(1);
    expect(result.actualResults.shots).toBe(1024);
  });

  test("should call progress callback", async () => {
    const circuit: CircuitState = {
      numQubits: 1,
      gates: [],
      measurements: [0],
    };

    const progressValues: number[] = [];
    const onProgress = (progress: number) => progressValues.push(progress);

    await executeCircuit(circuit, "simulator", onProgress);
    expect(progressValues.length).toBeGreaterThan(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
  });
});
