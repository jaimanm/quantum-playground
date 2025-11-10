import type { GateColors, GateType } from "../types";

// --- Circuit Constants ---
export const PADDING = 40;
export const QUBIT_SPACING = 80;
export const GATE_SIZE = 56; // Corresponds to w-14/h-14 in Tailwind
export const CIRCUIT_START_X = PADDING + 30;
export const GATE_MARGIN = 4;
export const MIN_QUBITS = 2;
export const MAX_QUBITS = 8;

// --- Gate Color Configuration (Pastel Palette with Alpha) ---
export const GATE_COLORS: Record<GateType | "DEFAULT", GateColors> = {
  X: {
    bg: "bg-pink-400",
    hoverBg: "hover:bg-pink-300",
    border: "border-pink-200",
    canvasBg: "rgba(249, 168, 212, 0.85)",
    canvasBorder: "#fbcfe8",
  },
  Y: {
    bg: "bg-emerald-400",
    hoverBg: "hover:bg-emerald-300",
    border: "border-emerald-200",
    canvasBg: "rgba(110, 231, 183, 0.85)",
    canvasBorder: "#a7f3d0",
  },
  Z: {
    bg: "bg-indigo-400",
    hoverBg: "hover:bg-indigo-300",
    border: "border-indigo-200",
    canvasBg: "rgba(165, 180, 252, 0.85)",
    canvasBorder: "#c7d2fe",
  },
  H: {
    bg: "bg-amber-400",
    hoverBg: "hover:bg-amber-300",
    border: "border-amber-200",
    canvasBg: "rgba(252, 211, 77, 0.85)",
    canvasBorder: "#fde68a",
  },
  M: {
    bg: "bg-gray-400",
    hoverBg: "hover:bg-gray-300",
    border: "border-gray-200",
    canvasBg: "rgba(156, 163, 175, 0.85)",
    canvasBorder: "#d1d5db",
  },
  DEFAULT: {
    bg: "bg-cyan-400",
    hoverBg: "hover:bg-cyan-300",
    border: "border-cyan-200",
    canvasBg: "rgba(103, 232, 249, 0.85)",
    canvasBorder: "#a5f3fc",
  },
};
