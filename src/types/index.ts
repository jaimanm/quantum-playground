/**
 * Type definitions for the Quantum Circuit Builder
 */

export interface GateColors {
  bg: string;
  hoverBg: string;
  border: string;
  canvasBg: string;
  canvasBorder: string;
}

export type GateType = "X" | "Y" | "Z" | "H";

export interface PlacedGate {
  type: GateType;
  qubit: number;
  col: number;
  id?: string; // Unique identifier for tracking animations
}

export interface GateAnimation {
  id: string;
  fromCol: number;
  toCol: number;
  progress: number; // 0 to 1
}

export interface GateDeletionAnimation {
  id: string;
  progress: number; // 0 to 1
}

export interface DraggedGateInfo extends PlacedGate {
  x: number;
  y: number;
}
