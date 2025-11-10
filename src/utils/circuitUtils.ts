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
 * Calculates the insertion column based on cursor X position.
 * This enables inserting gates between existing gates (smartphone-style).
 *
 * @param cursorX - The X coordinate of the cursor relative to the circuit canvas
 * @param qubit - The qubit wire to check
 * @param gatesOnCircuit - All placed gates
 * @param circuitStartX - The X coordinate where gates start (CIRCUIT_START_X constant)
 * @param gateSize - The size of each gate cell (GATE_SIZE constant)
 * @returns The column index where the gate should be inserted
 */
export const findInsertionColumn = (
  cursorX: number,
  qubit: number,
  gatesOnCircuit: PlacedGate[],
  circuitStartX: number,
  gateSize: number
): number => {
  const gatesOnQubit = gatesOnCircuit
    .filter((g) => g.qubit === qubit)
    .sort((a, b) => a.col - b.col);

  if (gatesOnQubit.length === 0) {
    return 0; // First column
  }

  // Calculate which column the cursor is hovering over
  const relativeX = cursorX - circuitStartX;
  // Use floor so insertion gap lines up with left edge the cursor has crossed
  const hoveredCol = Math.max(0, Math.floor(relativeX / gateSize));

  // Find the insertion point among existing gates
  // Compare against the index (i) not the gate's col property, since gates
  // may have been filtered/compacted and their col values don't reflect their
  // current visual position
  for (let i = 0; i < gatesOnQubit.length; i++) {
    if (hoveredCol <= i) {
      return i; // Insert before this gate (at position i in the sequence)
    }
  }

  // Cursor is after all gates
  return gatesOnQubit.length;
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

/**
 * Creates a virtual layout of gates with a gap for insertion.
 * Used during drag to show where gates will be after drop (smartphone-style).
 *
 * @param gates - Current placed gates
 * @param insertQubit - The qubit where insertion will happen
 * @param insertCol - The column index where to insert (among gates on that qubit)
 * @param draggedGate - The gate being dragged (to exclude from calculations if moving)
 * @returns Updated gates array with adjusted columns and info about moved gates
 */
export const createVirtualLayoutWithGap = (
  gates: PlacedGate[],
  insertQubit: number,
  insertCol: number,
  draggedGate?: { qubit: number; col: number } | null
): {
  gates: PlacedGate[];
  movedGates: Array<{ id: string; fromCol: number; toCol: number }>;
} => {
  // Filter out the dragged gate if it exists
  let workingGates = gates;
  if (draggedGate) {
    workingGates = gates.filter(
      (g) => !(g.qubit === draggedGate.qubit && g.col === draggedGate.col)
    );
  }

  // Get gates on the target qubit, sorted by column
  const gatesOnQubit = workingGates
    .filter((g) => g.qubit === insertQubit)
    .sort((a, b) => a.col - b.col);

  const otherGates = workingGates.filter((g) => g.qubit !== insertQubit);

  const movedGates: Array<{ id: string; fromCol: number; toCol: number }> = [];

  // Reassign columns: gates before insertCol stay same, gates at/after shift right
  const adjustedGatesOnQubit = gatesOnQubit.map((gate, index) => {
    if (index < insertCol) {
      // Check if column changed (shouldn't normally, but track it)
      if (gate.col !== index && gate.id) {
        movedGates.push({ id: gate.id, fromCol: gate.col, toCol: index });
      }
      return { ...gate, col: index };
    } else {
      // Shift right to make gap - this gate moves!
      const newCol = index + 1;
      if (gate.id) {
        movedGates.push({ id: gate.id, fromCol: gate.col, toCol: newCol });
      }
      return { ...gate, col: newCol };
    }
  });

  return {
    gates: [...otherGates, ...adjustedGatesOnQubit],
    movedGates,
  };
};

/**
 * Builds a virtual layout for a gap at (qubit, col) and computes which gates move
 * compared to the previous layout (virtual or baseline placed gates).
 */
export const buildVirtualGapDiff = (
  placedGates: PlacedGate[],
  currentVirtualLayout: PlacedGate[] | null,
  qubit: number,
  col: number,
  draggedGate?: { qubit: number; col: number } | null
): {
  virtualGates: PlacedGate[];
  movedGates: Array<{ id: string; fromCol: number; toCol: number }>;
} => {
  const virtualResult = createVirtualLayoutWithGap(
    placedGates,
    qubit,
    col,
    draggedGate
  );

  const previousLayout =
    currentVirtualLayout && currentVirtualLayout.length > 0
      ? currentVirtualLayout
      : placedGates;

  const moved: Array<{ id: string; fromCol: number; toCol: number }> = [];
  previousLayout.forEach((prevGate) => {
    if (!prevGate.id) return;
    const nextGate = virtualResult.gates.find((g) => g.id === prevGate.id);
    if (nextGate && nextGate.col !== prevGate.col) {
      moved.push({
        id: prevGate.id,
        fromCol: prevGate.col,
        toCol: nextGate.col,
      });
    }
  });

  return { virtualGates: virtualResult.gates, movedGates: moved };
};

/**
 * Computes animations required to close an existing virtual gap and return to baseline.
 */
export const buildGapCloseDiff = (
  placedGates: PlacedGate[],
  currentVirtualLayout: PlacedGate[] | null
): Array<{ id: string; fromCol: number; toCol: number }> => {
  if (!currentVirtualLayout || currentVirtualLayout.length === 0) return [];

  const moved: Array<{ id: string; fromCol: number; toCol: number }> = [];
  currentVirtualLayout.forEach((gapGate) => {
    if (!gapGate.id) return;
    const baselineGate = placedGates.find((g) => g.id === gapGate.id);
    if (baselineGate && baselineGate.col !== gapGate.col) {
      moved.push({
        id: gapGate.id,
        fromCol: gapGate.col,
        toCol: baselineGate.col,
      });
    }
  });
  return moved;
};
