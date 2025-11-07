import type { PlacedGate } from "../types";

/**
 * Helper to find the next available column for a qubit.
 * This implements the "auto-slide left" logic.
 */
export const findNextAvailableColumn = (
  qubit: number,
  gatesOnCircuit: PlacedGate[]
): number => {
  const gatesOnThisQubit = gatesOnCircuit.filter((g) => g.qubit === qubit);
  if (gatesOnThisQubit.length === 0) {
    return 0; // First column
  }
  // Find the maximum column index used on this wire
  const maxCol = Math.max(...gatesOnThisQubit.map((g) => g.col));
  return maxCol + 1; // Return the next one
};

/**
 * Generates a unique ID for a gate based on its properties
 */
export const generateGateId = (gate: PlacedGate): string => {
  return `${gate.type}-${gate.qubit}-${
    gate.col
  }-${Date.now()}-${Math.random()}`;
};

/**
 * Ensures all gates have IDs
 */
export const ensureGateIds = (gates: PlacedGate[]): PlacedGate[] => {
  return gates.map((gate) =>
    gate.id ? gate : { ...gate, id: generateGateId(gate) }
  );
};

/**
 * Compacts gates on a qubit after a gate is removed.
 * Shifts all gates to the left to fill gaps.
 * Returns updated gates and information about which gates moved.
 */
export const compactGatesOnQubit = (
  gates: PlacedGate[],
  qubit: number
): {
  gates: PlacedGate[];
  movedGates: Array<{ id: string; fromCol: number; toCol: number }>;
} => {
  // Get all gates on this qubit, sorted by column
  const gatesOnQubit = gates
    .filter((g) => g.qubit === qubit)
    .sort((a, b) => a.col - b.col);

  const movedGates: Array<{ id: string; fromCol: number; toCol: number }> = [];

  // Reassign columns sequentially starting from 0
  const reassignedGates = gatesOnQubit.map((gate, index) => {
    if (gate.col !== index && gate.id) {
      movedGates.push({ id: gate.id, fromCol: gate.col, toCol: index });
    }
    return {
      ...gate,
      col: index,
    };
  });

  // Get all gates NOT on this qubit
  const otherGates = gates.filter((g) => g.qubit !== qubit);

  // Combine them back together
  return {
    gates: [...otherGates, ...reassignedGates],
    movedGates,
  };
};
