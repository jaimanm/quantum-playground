import { useState, useCallback } from 'react';
import { CircuitState, Gate, GateType, ViewMode, CodeFramework, QuantumComputerType } from '../types/circuit';

export function useCircuit() {
  const [circuit, setCircuit] = useState<CircuitState>({
    numQubits: 2,
    gates: [],
    measurements: [],
  });

  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [codeFramework, setCodeFramework] = useState<CodeFramework>('qiskit');
  const [selectedQuantumComputer, setSelectedQuantumComputer] = useState<QuantumComputerType>('simulator');

  const addGate = useCallback((type: GateType, qubitIndices: number[], position: number, params?: { [key: string]: number }) => {
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
  }, []);

  const removeGate = useCallback((gateId: string) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.filter((gate) => gate.id !== gateId),
    }));
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
  };
}
