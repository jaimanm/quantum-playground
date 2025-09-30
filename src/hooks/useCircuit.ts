import { useState, useCallback } from "react";
import {
  CircuitState,
  Gate,
  GateType,
  ViewMode,
  CodeFramework,
  QuantumComputerType,
} from "../types/circuit";

export function useCircuit() {
  const [circuit, setCircuit] = useState<CircuitState>({
    numQubits: 2,
    gates: [],
    measurements: [],
  });

  const [viewMode, setViewMode] = useState<ViewMode>("interactive");
  const [codeFramework, setCodeFramework] = useState<CodeFramework>("qiskit");
  const [selectedQuantumComputer, setSelectedQuantumComputer] =
    useState<QuantumComputerType>("simulator");

  const addGate = useCallback(
    (
      type: GateType,
      qubitIndices: number[],
      position: number,
      params?: { [key: string]: number }
    ) => {
      const newGate: Gate = {
        id: `gate-${Date.now()}-${Math.random()}`,
        type,
        qubitIndices,
        position,
        params,
      };

      setCircuit((prev) => ({
        ...prev,
        gates: [...prev.gates, newGate],
      }));
    },
    []
  );

  const removeGate = useCallback((gateId: string) => {
    setCircuit((prev) => {
      const remainingGates = prev.gates.filter((gate) => gate.id !== gateId);

      // Sort gates by position to process them in order
      const sortedGates = [...remainingGates].sort(
        (a, b) => a.position - b.position
      );
      const shiftedGates: Gate[] = [];

      // Shift each gate left as much as possible
      sortedGates.forEach((gate) => {
        const affectedQubits = gate.qubitIndices;
        let optimalPosition = 0;

        // Find the leftmost position where this gate can be placed
        for (let pos = 0; pos <= gate.position; pos++) {
          const hasConflict = shiftedGates.some(
            (placedGate) =>
              placedGate.position === pos &&
              placedGate.qubitIndices.some((q) => affectedQubits.includes(q))
          );

          if (!hasConflict) {
            optimalPosition = pos;
            break;
          } else {
            optimalPosition = pos + 1;
          }
        }

        shiftedGates.push({ ...gate, position: optimalPosition });
      });

      return {
        ...prev,
        gates: shiftedGates,
      };
    });
  }, []);

  const updateGate = useCallback((gateId: string, updates: Partial<Gate>) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.map((gate) =>
        gate.id === gateId ? { ...gate, ...updates } : gate
      ),
    }));
  }, []);

  const clearCircuit = useCallback(() => {
    setCircuit((prev) => ({
      ...prev,
      gates: [],
      measurements: [],
    }));
  }, []);

  const setNumQubits = useCallback((num: number) => {
    setCircuit((prev) => ({
      ...prev,
      numQubits: num,
      gates: prev.gates.filter((gate) =>
        gate.qubitIndices.every((q) => q < num)
      ),
    }));
  }, []);

  const loadCircuit = useCallback((newCircuit: CircuitState) => {
    setCircuit(newCircuit);
  }, []);

  const compactCircuit = useCallback(() => {
    setCircuit((prev) => {
      // Sort gates by position to process them in order
      const sortedGates = [...prev.gates].sort(
        (a, b) => a.position - b.position
      );
      const compactedGates: Gate[] = [];

      // Shift each gate left as much as possible
      sortedGates.forEach((gate) => {
        const affectedQubits = gate.qubitIndices;
        let optimalPosition = 0;

        // Find the leftmost position where this gate can be placed
        for (let pos = 0; pos <= gate.position; pos++) {
          const hasConflict = compactedGates.some(
            (placedGate) =>
              placedGate.position === pos &&
              placedGate.qubitIndices.some((q) => affectedQubits.includes(q))
          );

          if (!hasConflict) {
            optimalPosition = pos;
            break;
          } else {
            optimalPosition = pos + 1;
          }
        }

        compactedGates.push({ ...gate, position: optimalPosition });
      });

      return {
        ...prev,
        gates: compactedGates,
      };
    });
  }, []);

  return {
    circuit,
    viewMode,
    setViewMode,
    codeFramework,
    setCodeFramework,
    selectedQuantumComputer,
    setSelectedQuantumComputer,
    addGate,
    removeGate,
    updateGate,
    clearCircuit,
    setNumQubits,
    loadCircuit,
    compactCircuit,
  };
}
